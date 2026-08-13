> This article examines a historical Android release in a controlled lab. The institution, package identifier, domains, API paths, credentials, certificate identity, account information, and customer data are intentionally omitted or replaced. Testing was limited to an APK I lawfully obtained, a researcher-controlled device, and my own test data. This is not an assessment of the current release.

Mobile applications are useful reverse-engineering targets because the package contains both executable logic and a surprisingly rich map of the product: its manifest, resources, database models, network interfaces, and cryptographic choices. In this project I analyzed version 1.4.4 of an Android ePassbook application and followed several security-relevant values from their source to their eventual use.

The most interesting lesson was not that one search command found a secret. It was that a reliable finding needs an evidence chain. A suspicious constant only becomes meaningful after answering four questions:

1. Where did the value originate?
2. Is it reachable in the reviewed build?
3. What data or security boundary does it affect?
4. What uncertainty remains without server-side visibility?

This write-up presents that process without publishing a turnkey exploit path.

## Scope and ground rules

The target was an archived APK identified as versionName `1.4.4` and versionCode `68`. I recorded the full SHA-256 digest privately; the abbreviated public fingerprint is:

```text
F8206F41BC99...C5CFD8D
```

The full hash is worth recording before analysis. It makes the work reproducible and prevents conclusions from being silently attributed to a different build. I abbreviated it here because a complete digest can also act as an indirect product identifier.

![Sanitized terminal capture showing version and hash](assets/01-artifact-identity.png)

The review covered static package inspection, decompilation, data-flow tracing, a local database review with synthetic records, and limited runtime observation on a researcher-controlled Android environment. It did not cover source repositories, production infrastructure, gateway configuration, or authorization logic on the server.

I also adopted a publication rule: evidence can be precise without exposing operational secrets. In screenshots and snippets I renamed classes, removed institution-specific strings, replaced credentials with `[REDACTED]`, and omitted service locations.

### Results at a glance

| Observation | Evidence in v1.4.4 | Main security boundary | Primary remediation |
|---|---|---|---|
| Permissive TLS validation | Confirmed in four first-party client constructors | Server authentication | Restore platform certificate and hostname validation |
| Embedded Basic credentials | Confirmed constants and call sites | API client authentication | Rotate values; replace shared secrets with per-user, short-lived authorization |
| Fixed-key local AES | Confirmed DAO-to-helper data flow | Data at rest | Minimize stored data; use per-install Keystore keys and authenticated encryption |
| Sensitive logging | Confirmed code; runtime exposure varies by flow | Data handling and diagnostics | Remove sensitive values and enforce release-safe logging |
| Legacy DES/RSA envelope | Confirmed design and reachable request helpers | Application-layer payload protection | Reassess need; modernize and add explicit lifecycle and replay controls |

These labels describe evidence in the archived client. They are not claims about present-day server behavior or the current application.

## Tooling

My core toolkit was deliberately small:

- `apktool` for decoded resources and the manifest
- `jadx` for readable Java-like decompilation and cross-references
- `aapt` or `apkanalyzer` for package metadata
- `ripgrep` for fast, repeatable searches across decompiled code
- `openssl` for inspecting the bundled public certificate without contacting a server
- `adb`, `logcat`, and `sqlite3` for controlled local verification

The following examples use placeholders. Do not substitute a third party's infrastructure or data; use an APK and test environment you are authorized to examine.

```bash
# Establish the identity of the exact artifact.
sha256sum historical-release.apk

# Read metadata without installing the application.
aapt dump badging historical-release.apk | grep -E "package:|versionCode|versionName"

# Decode resources and produce readable decompiled sources.
apktool d -f historical-release.apk -o decoded
jadx -d decompiled historical-release.apk

# Create a first-pass inventory of security-relevant constructs.
rg -n -S \
  'HostnameVerifier|X509TrustManager|checkServerTrusted|Cipher\.getInstance|SecretKeySpec|Authorization|Log\.[dievw]' \
  decompiled/sources
```

On PowerShell, the artifact check is simply:

```powershell
Get-FileHash .\historical-release.apk -Algorithm SHA256
Select-String -Path .\decoded\AndroidManifest.xml -Pattern 'versionName|versionCode'
```

The first search is triage, not proof. Library code can contain the same words, decompilers can misrepresent control flow, and a class can be dead code. I therefore restricted later searches to the application's own namespace and used call sites to establish reachability.

## 1. Mapping the application before chasing findings

I started with the manifest and top-level package tree. This answered basic questions: which components are exported, which permissions are requested, which application classes initialize networking, and where Room/database entities live.

Then I grouped the first-party code into four rough areas:

```text
application/
|-- data/dao/               local persistence
|-- network/remote/         service construction and API calls
|-- network/security/       request encryption helpers
`-- ui/                     user flows and presentation
```

This map made later cross-references much faster. For example, finding `Cipher.getInstance("AES")` is only the beginning; locating its callers in a DAO showed that it protected locally stored card data rather than a transport payload.

## 2. Finding: permissive TLS validation in custom clients

Four first-party service constructors created custom TLS contexts. Each supplied an `X509TrustManager` whose server-validation method did not validate the certificate chain, then installed a `HostnameVerifier` that always returned `true`.

The relevant structure, renamed and simplified for publication, looked like this:

```java
TrustManager[] managers = new TrustManager[] {
    new X509TrustManager() {
        public void checkServerTrusted(X509Certificate[] chain, String authType) {
            // no chain validation
        }
    }
};

SSLContext context = SSLContext.getInstance("SSL");
context.init(null, managers, new SecureRandom());

client.sslSocketFactory(context.getSocketFactory(), (X509TrustManager) managers[0]);
client.hostnameVerifier((host, session) -> true);
```

![Sanitized code evidence for permissive TLS validation](assets/02-tls-validation.png)

### Why both checks matter

TLS authenticates a service through two related checks. Chain validation asks whether the certificate leads to a trusted issuer and remains otherwise valid. Hostname verification asks whether that valid certificate belongs to the hostname being contacted. Disabling either check weakens authentication; disabling both can allow an attacker who controls the network path to impersonate the remote service for affected clients.

I did not publish endpoint mappings or interception instructions. They are unnecessary to explain the defect and would make the article more operational than educational.

### How I verified reachability

I searched for construction of each service singleton, followed the returned API interface into registration, account, notification, and statement flows, and confirmed that the customized client was passed into the HTTP stack. This step separated first-party vulnerable construction from harmless references inside networking libraries.

### Remediation

The safest fix is to remove the custom trust manager and hostname verifier, allowing the platform/HTTP library defaults to perform validation. If certificate pinning is required as defense in depth, it should be centralized, scoped to controlled domains, and designed with backup pins and rotation in mind. Automated negative tests should reject a self-signed chain, an expired certificate, and a valid certificate for the wrong host.

## 3. Finding: reusable Basic credentials embedded in the APK

The decompiled service layer contained several environment-labelled Basic Authorization constants. Call-site tracing showed that production-labelled material was supplied to multiple API interface methods, while another shared value was used for a notification-registration flow.

```java
private static final String CLIENT_AUTH_PROD = "Basic [REDACTED]";
private static final String CLIENT_AUTH_PUSH = "Basic [REDACTED]";

api.register(CLIENT_AUTH_PROD, request);
api.registerNotification(CLIENT_AUTH_PUSH, request);
```

An APK runs on an untrusted device and can be copied and inspected. A credential distributed inside it must therefore be treated as recoverable, even when the code is obfuscated or the value is Base64-encoded. Base64 changes representation; it does not provide secrecy.

The client-side evidence alone does not establish what an unauthenticated caller could do with the values. That depends on server-side authorization, per-user authentication, freshness controls, rate limiting, and endpoint behavior. The defensible conclusion is narrower: the values cannot safely serve as confidential, application-wide authorization factors.

Recommended remediation is to rotate the exposed values, review their use in server logs, and avoid shared mobile-client secrets as an authorization boundary. Sensitive operations should rely on short-lived per-user credentials and server-side authorization.

## 4. Finding: fixed-key encryption for local card records

The local card DAO called a helper before inserting or updating card records. That helper used a fixed 16-byte AES key embedded in the APK and requested the cipher using only the algorithm name:

```java
private static final byte[] KEY = { /* REDACTED */ };

SecretKeySpec key = new SecretKeySpec(KEY, "AES");
Cipher cipher = Cipher.getInstance("AES");
cipher.init(Cipher.ENCRYPT_MODE, key);
```

![Sanitized data-flow and fixed-key AES evidence](assets/03-local-storage.png)

On common Android/Java providers, the transformation `AES` resolves to an ECB-compatible default. More importantly, the same recoverable key is shared by every installation of the APK. Anyone who obtains both a local database and the public application package has the ingredients needed to reproduce the transformation offline.

I verified the data flow in both directions:

```text
card number -> DAO encrypt helper -> database record
database record -> DAO decrypt helper -> application model
```

For the lab check, I worked only on a copied database containing my own synthetic data. A safe schema-first workflow is:

```bash
# Work on a copy. Do not publish the database.
cp passbook_database passbook_database.lab-copy

# Inspect structure before selecting any rows.
sqlite3 passbook_database.lab-copy '.tables'
sqlite3 passbook_database.lab-copy '.schema <REDACTED_TABLE>'
```

The publication does not include the database, the embedded key, a decryption utility, or recovered values.

The better design is to avoid storing full card numbers when a token or masked value is sufficient. If reversible local protection is genuinely required, use a per-install, non-exportable Android Keystore key and an authenticated mode such as AES-GCM with a fresh nonce per record. Migration and backup behavior need explicit design as well.

## 5. Finding: plaintext and decrypted values in release logging paths

The DAO logged a decrypted card value after reading it, and service code logged request material and decrypted response content. One request-encryption helper also logged its output.

```java
Log.d("APP", "decrypted: " + sensitiveValue);
Log.d("APP", "request: " + requestJson);
Log.d("APP", "response: " + decryptedPayload);
```

Logging immediately before encryption or after decryption bypasses the protections provided by transport and storage encryption. Practical exposure varies by Android version, build configuration, device state, diagnostic tooling, and support processes, so I describe this as confirmed code with runtime impact dependent on the path.

For validation, I used synthetic values that were easy to recognize and filtered only the researcher-controlled process:

```bash
adb logcat --clear
adb shell pidof com.example.redacted
adb logcat --pid=<PID>
```

No real card number, identifier, OTP, access code, token, or full log capture should appear in a public article. The correct engineering response is to remove sensitive concatenation, use structured allow-listed logging, suppress verbose output in release builds, and add a build-time scan for risky log statements.

## 6. Observation: legacy DES/RSA request envelope

The v1.4.4 security helper generated a one-time DES key, encrypted JSON payloads with a provider-default DES transformation, wrapped the symmetric key using `RSA/ECB/PKCS1Padding`, and loaded the RSA public key from an asset bundled with the APK. A plaintext hash was included alongside the encrypted payload.

![Sanitized diagram of the legacy request envelope](assets/04-request-envelope.png)

The static evidence was sufficient to describe the design, but not to claim compromise of server-held private key material or universal exposure of all requests. The important design concerns are:

- DES has a 56-bit effective key size and is obsolete.
- ECB-style encryption does not hide repeated block patterns and is not authenticated.
- PKCS#1 v1.5 encryption has weaker misuse resistance than modern RSA-OAEP-based designs.
- A bundled public certificate is not itself a secret, but a long-lived envelope key creates lifecycle and historical-confidentiality questions for the corresponding server-side private key.
- Application-layer encryption does not compensate for broken TLS authentication.

I inspected only non-identifying certificate properties. A publication-safe command is:

```bash
base64 -d decoded/assets/public_key.der.b64 > public_key.der
openssl x509 -inform DER -in public_key.der \
  -noout -dates -fingerprint -sha256
```

Do not add `-subject` or `-issuer` to a public screenshot when those fields identify the institution or an employee.

Modern remediation should begin by restoring correct TLS and documenting whether a second application-layer envelope is still necessary. If it is retained, use a reviewed authenticated construction, modern key wrapping, explicit versioning, replay resistance, and a defined key-rotation process.

## What did not become a finding

Reverse engineering produces many suspicious-looking fragments. I excluded claims that I could not connect to reachable first-party code, findings that depended entirely on unknown server behavior, and observations from a newer application version. I also did not label emulator or root checks as vulnerabilities: they may slow analysis, but they are not authorization controls.

This negative space matters. A credible portfolio piece is strengthened by saying what the evidence does *not* prove.

## A repeatable workflow for Android reverse engineering

The workflow I would reuse on another application is:

1. Hash and identify the exact APK.
2. Decode resources and decompile code with two complementary tools.
3. Separate first-party namespaces from bundled libraries.
4. Search for high-signal primitives, constants, and logging calls.
5. Trace each candidate through callers and data models.
6. Confirm behavior only in an authorized, controlled environment.
7. Record evidence, uncertainty, impact, and remediation together.
8. Sanitize screenshots and run a final secret/identity review before publishing.

This project improved my ability to move from strings to semantics. The useful skill was not merely recognizing `return true` or `Cipher.getInstance("AES")`; it was proving where those constructs sat in the application and communicating their effect without overstating the available evidence.

## Publication checklist

Before this article goes live, I will verify that it contains none of the following:

- institution or legal-entity names
- real package identifiers, domains, paths, IP addresses, or email addresses
- Basic credentials, tokens, API keys, cryptographic keys, or decoded secret values
- certificate subject/issuer fields or personal names
- account, card, NIC/national-ID, phone, device, OTP, or statement data
- unredacted proxy captures, databases, logs, scripts, or bypass hooks
- claims about the latest release or remediation status that I did not verify

## Closing thoughts

An APK should be assumed to be observable by its user. Obfuscation can increase analysis cost, but it cannot turn shared client credentials or embedded symmetric keys into durable secrets. Similarly, custom cryptography cannot repair a transport client that no longer authenticates its peer.

For me, the main outcome of this exercise was a more disciplined reverse-engineering process: identify the artifact, map the code, trace the data, test only what is authorized, state uncertainty, and publish the minimum detail needed to teach the lesson.
