/* Shared Tailwind theme. Loaded on every page, after the Tailwind CDN script.
   Editing the palette here changes the whole site. */
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                serif: ['ui-serif', 'Georgia', 'Cambria', 'Palatino Linotype', 'Times New Roman', 'serif'],
                sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
            },
            colors: {
                /* surfaces */
                bg:      '#0F1012',
                surface: '#16181B',
                raised:  '#1B1E22',
                /* hairlines */
                line: {
                    DEFAULT: '#272B30',
                    soft:    '#1D2024'
                },
                /* text */
                paper: {
                    100: '#ECEAE7',   /* headings */
                    200: '#BDBAB5',   /* body */
                    400: '#8A8781',   /* muted / meta */
                    600: '#5E5C57'    /* faintest */
                },
                /* the one accent, used sparingly */
                accent: {
                    DEFAULT: '#4CC38A',
                    soft:    '#7FD9AE',
                    dim:     '#2C6E4E'
                }
            },
            maxWidth: {
                measure: '38rem',   /* ~68ch, the reading column */
                page:    '58rem'
            },
            letterSpacing: {
                label: '0.14em'
            }
        }
    }
}
