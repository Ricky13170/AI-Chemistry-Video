export function LabIllustration() {
    return (
        <svg
            className="lab-illustration"
            viewBox="0 0 450 340"
            fill="none"
            aria-label="Illustration of laboratory glassware with teal and purple liquids"
            role="img"
        >
            <defs>
                <linearGradient
                    id="glass"
                    x1="100"
                    y1="100"
                    x2="300"
                    y2="300"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#b9f7f7" stopOpacity=".17" />
                    <stop offset="1" stopColor="#a8f4f4" stopOpacity=".04" />
                </linearGradient>
                <linearGradient
                    id="liquid"
                    x1="220"
                    y1="200"
                    x2="270"
                    y2="300"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#39c5d3" />
                    <stop offset="1" stopColor="#10929f" />
                </linearGradient>
                <linearGradient
                    id="purple"
                    x1="80"
                    y1="180"
                    x2="180"
                    y2="270"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#bda6ee" />
                    <stop offset="1" stopColor="#8772c2" />
                </linearGradient>
                <radialGradient id="aura">
                    <stop stopColor="#63d4db" stopOpacity=".12" />
                    <stop offset="1" stopColor="#63d4db" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="243" cy="185" r="142" fill="url(#aura)" />
            <ellipse
                cx="240"
                cy="304"
                rx="155"
                ry="9"
                fill="#062c36"
                fillOpacity=".45"
            />
            <g className="molecule" opacity=".7">
                <path
                    d="m275 66 37-23 39 22v44l-39 23-37-23zM351 65l32-16M312 132v28"
                    stroke="#55c2cd"
                    strokeOpacity=".25"
                />
                <circle cx="275" cy="66" r="6" fill="#73d6dc" />
                <circle cx="312" cy="43" r="9" fill="#b7a4e5" />
                <circle cx="351" cy="65" r="5" fill="#66c9d3" />
                <circle cx="351" cy="109" r="8" fill="#66c9d3" />
                <circle cx="312" cy="132" r="5" fill="#b7a4e5" />
                <circle cx="383" cy="49" r="4" fill="#e8cf85" />
                <circle cx="312" cy="160" r="4" fill="#5bbbc6" />
            </g>
            <path
                d="M225 66v231M217 66h16M195 297h61"
                stroke="#7db4b7"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path d="M224 124h-61M224 192h90" stroke="#59898c" strokeWidth="5" />
            <rect
                x="217"
                y="118"
                width="15"
                height="13"
                rx="2"
                fill="#143a42"
                stroke="#78a7aa"
            />
            <rect
                x="217"
                y="186"
                width="15"
                height="13"
                rx="2"
                fill="#143a42"
                stroke="#78a7aa"
            />
            <path
                d="M134 106h32m-27 0v45l-38 66c-4 7 0 13 8 13h82c8 0 12-6 8-13l-38-66v-45"
                fill="url(#glass)"
                stroke="#b6e5e7"
                strokeWidth="2.2"
            />
            <path
                d="m119 187-17 31c-2 4 0 7 5 7h86c4 0 6-3 4-7l-17-31c-20 9-40-8-61 0"
                fill="url(#purple)"
                fillOpacity=".92"
            />
            <path
                d="m120 188 17-31v-42M108 218h3"
                stroke="#e0ffff"
                strokeOpacity=".5"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M132 106h36"
                stroke="#9bc6c9"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <rect x="138" y="97" width="24" height="8" rx="2" fill="#c4e4e2" />
            <circle className="bubble" cx="144" cy="215" r="3" fill="#e9e3ff" />
            <circle className="bubble b2" cx="165" cy="211" r="2" fill="#e9e3ff" />
            <circle className="bubble b3" cx="152" cy="205" r="4" fill="#d7cbfa" />
            <path
                d="M288 150h37m-33 0v62c-19 10-30 27-30 43a45 45 0 0 0 90 0c0-16-11-33-31-43v-62"
                fill="url(#glass)"
                stroke="#a6e0e3"
                strokeWidth="2.3"
            />
            <path d="M267 248c15-10 42 9 80 0a40 40 0 1 1-80 0" fill="url(#liquid)" />
            <path
                d="M294 160v58c-11 6-23 21-24 27"
                stroke="#dcffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeOpacity=".55"
            />
            <path
                d="M286 149h41"
                stroke="#b3dedf"
                strokeWidth="6"
                strokeLinecap="round"
            />
            <rect x="292" y="137" width="29" height="10" rx="2" fill="#cceceb" />
            <path
                d="M282 263a24 24 0 0 0 11 14"
                stroke="#a6f2f1"
                strokeOpacity=".3"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle className="bubble b3" cx="310" cy="276" r="3" fill="#9aeeec" />
            <circle className="bubble" cx="296" cy="265" r="2.5" fill="#9aeeec" />
            <circle className="bubble b2" cx="321" cy="270" r="4" fill="#9aeeec" />
            <path
                d="M173 248v43a9 9 0 0 0 18 0v-43"
                stroke="#a3d2d5"
                strokeWidth="2"
                fill="url(#glass)"
            />
            <path d="M176 274v17a6 6 0 0 0 12 0v-17" fill="#ecc56e" />
            <path
                d="M169 247h26"
                stroke="#c1dfdf"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M135 258v34a9 9 0 0 0 18 0v-34"
                stroke="#a3d2d5"
                strokeWidth="2"
                fill="url(#glass)"
            />
            <path d="M138 279v13a6 6 0 0 0 12 0v-13" fill="#d19ab9" />
            <path
                d="M132 257h24"
                stroke="#c1dfdf"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M126 274h75M129 274v28M198 274v28M124 303h80"
                stroke="#427e86"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M91 299h293"
                stroke="#6eabad"
                strokeOpacity=".35"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M87 110h22m-11-11v22M367 205h15m-7.5-7.5v15"
                stroke="#73aeb1"
                strokeOpacity=".4"
                strokeWidth="1.5"
            />
            <circle cx="380" cy="163" r="3" fill="#ad9cce" fillOpacity=".5" />
            <circle cx="98" cy="167" r="2" fill="#b6dfdb" fillOpacity=".5" />
        </svg>
    );
}
