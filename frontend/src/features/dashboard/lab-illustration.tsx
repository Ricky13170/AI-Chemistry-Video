/** Decorative, original SVG artwork. Kept as SVG so it stays sharp in all aspect ratios. */
export function LabIllustration({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 640 360"
            preserveAspectRatio="xMidYMid meet"
            className={`lab-illustration ${className}`.trim()}
            role="img"
            aria-label="A midnight chemistry laboratory with softly glowing colorful flasks and a microscope"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="midnight-bench" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#48b9ef" />
                    <stop offset="1" stopColor="#274fbc" />
                </linearGradient>
                <linearGradient id="midnight-glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f9f3ff" stopOpacity=".28" />
                    <stop offset="1" stopColor="#d6c3ff" stopOpacity=".09" />
                </linearGradient>
                <linearGradient id="midnight-beam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4bc9ec" stopOpacity=".12" />
                    <stop offset="1" stopColor="#4bc9ec" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="midnight-halo">
                    <stop offset="0" stopColor="#7b6acc" stopOpacity=".14" />
                    <stop offset="1" stopColor="#7b6acc" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Quiet details on the far wall, behind the lab bench. */}
            <ellipse cx="467" cy="220" rx="190" ry="160" fill="url(#midnight-halo)" />
            <rect x="392" y="131" width="193" height="78" rx="7" fill="#59359a" opacity=".32" />
            <path d="M403 168h172" stroke="#9270d1" strokeOpacity=".26" strokeWidth="3" />
            <path d="M423 132v-17h10v17m54 0v-29h12v29m48 0v-22h9v22" fill="none" stroke="#9270d1" strokeOpacity=".22" strokeWidth="3" />
            <circle cx="600" cy="117" r="3" fill="#e2ccff" opacity=".18" />
            <circle cx="330" cy="182" r="4" stroke="#dfcfff" strokeOpacity=".2" />

            {/* Diffuse cyan ceiling lamp: no bright glow filter. */}
            <path d="M372 7h158l79 278H288z" fill="url(#midnight-beam)" />
            <rect x="379" y="0" width="145" height="8" rx="4" fill="#39bce4" />
            <path d="M386 10h132" stroke="#84e4f7" strokeOpacity=".42" strokeWidth="2" />

            {/* Blue laboratory table. The equipment sits above it. */}
            <rect x="253" y="294" width="380" height="17" rx="5" fill="url(#midnight-bench)" />
            <rect x="265" y="310" width="363" height="40" rx="3" fill="#223c9a" opacity=".83" />
            <path d="M261 296h364" stroke="#96e3ff" strokeWidth="2" strokeOpacity=".45" />

            {/* Pink Erlenmeyer flask. */}
            <g transform="translate(272 199)">
                <path d="M31 5h18v31l28 57a9 9 0 0 1-8 13H11a9 9 0 0 1-8-13l28-57z" fill="url(#midnight-glass)" stroke="#e0d3ff" strokeOpacity=".8" strokeWidth="2" />
                <path d="M17 72h46l17 27a6 6 0 0 1-6 7H7a6 6 0 0 1-5-7z" fill="#f875b0" />
                <path d="M32 9v27l-19 39" fill="none" stroke="#fff" strokeOpacity=".34" strokeWidth="3" strokeLinecap="round" />
                <path d="M30 5h21" stroke="#ede0ff" strokeWidth="4" strokeLinecap="round" />
                <circle cx="31" cy="91" r="3" fill="#ffe7f3" opacity=".68" />
            </g>

            {/* Green round flask, bubbles and a little vapor. */}
            <g transform="translate(359 170)">
                <path d="M30 4h17v36a47 47 0 1 1-17 0z" fill="url(#midnight-glass)" stroke="#e3d6ff" strokeOpacity=".86" strokeWidth="2" />
                <path d="M-6 83c25-9 60 7 89 0a45 45 0 0 1-89 0" fill="#8aec79" />
                <rect x="30" y="4" width="17" height="34" rx="3" fill="#bcb0f7" opacity=".23" />
                <path d="M29 4h19" stroke="#e0d6ff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="18" cy="99" r="5" fill="#efffe7" opacity=".5" />
                <circle cx="45" cy="91" r="3" fill="#efffe7" opacity=".6" />
                <circle className="bubble" cx="33" cy="70" r="4" fill="none" stroke="#f4ffe9" strokeOpacity=".55" strokeWidth="1.5" />
                <path d="M33-9q-12-11-2-24t1-24" fill="none" stroke="#9e98ed" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Pastel-blue microscope. */}
            <g transform="translate(450 198)">
                <path d="M5 95h87v10H5z" fill="#7b86ea" />
                <path d="M44 91c-24-11-32-32-18-60l13 7c-9 26-5 35 20 45z" fill="#7f90f0" />
                <path d="M57 72h25v7H57z" fill="#4c57ad" />
                <rect x="25" y="4" width="19" height="59" rx="5" fill="#b3b8ff" transform="rotate(-16 34 35)" />
                <circle cx="17" cy="49" r="6" fill="#6979dd" />
                <path d="M17 95h52" stroke="#c3c8ff" strokeOpacity=".45" strokeWidth="2" />
            </g>

            {/* Test flask held above a tiny burner. */}
            <g transform="translate(523 176)">
                <path d="M49 8v118M10 128h77" stroke="#160e37" strokeWidth="4" strokeLinecap="round" />
                <path d="M10 22h43" stroke="#a08ae0" strokeWidth="3" strokeLinecap="round" />
                <path d="M15 37h22v23l18 45a8 8 0 0 1-7 11H5a8 8 0 0 1-7-11l17-45z" fill="url(#midnight-glass)" stroke="#e1d3ff" strokeOpacity=".8" strokeWidth="2" />
                <path d="M6 89h43l6 18a7 7 0 0 1-7 9H4a7 7 0 0 1-7-9z" fill="#82df8b" />
                <ellipse cx="28" cy="137" rx="19" ry="7" fill="#9f80ea" />
                <path d="M28 111c-9 12-7 20 0 24 9-8 9-15 0-24z" fill="#ffcb68" opacity=".85" />
            </g>

            {/* Yellow round flask at the end of the bench. */}
            <g transform="translate(586 241)">
                <rect x="16" y="2" width="16" height="28" rx="3" fill="url(#midnight-glass)" stroke="#e5d6ff" strokeOpacity=".85" strokeWidth="2" />
                <circle cx="24" cy="66" r="35" fill="url(#midnight-glass)" stroke="#e5d6ff" strokeOpacity=".85" strokeWidth="2" />
                <path d="M-11 66a35 35 0 0 0 70 0z" fill="#ffd267" />
                <circle cx="8" cy="52" r="3" fill="#fff" opacity=".3" />
            </g>
        </svg>
    );
}
