/* ===========================================
   TOOLHUB AI — SHARED TOOL CATALOG
   Used by both the homepage (js/script.js) and the
   dashboard (js/dashboard.js). Add new tools here only —
   both pages read from this one list.
=========================================== */

const TOOLS = [
    {
        name: "Image to PDF",
        desc: "Turn photos and screenshots into a single, clean PDF — reorder, rotate and merge.",
        href: "/tools/image-to-pdf/index.html",
        icon: "fa-file-pdf",
        category: "pdf",
        iconClass: "cat-pdf",
        isNew: false,
        popular: true,
        addedOrder: 1
    },
    {
        name: "PDF Merger",
        desc: "Combine multiple PDF files into one document in the order you choose.",
        href: "/tools/pdf-merger/index.html",
        icon: "fa-layer-group",
        category: "pdf",
        iconClass: "cat-pdf",
        isNew: true,
        popular: false,
        addedOrder: 8
    },
    {
        name: "Image Resizer",
        desc: "Resize images to exact dimensions or a target file size in a few clicks.",
        href: "/tools/image-resizer/index.html",
        icon: "fa-crop-simple",
        category: "image",
        iconClass: "cat-image",
        isNew: false,
        popular: false,
        addedOrder: 3
    },
    {
        name: "AI Email Writer",
        desc: "Draft clear, well-toned emails in seconds — just describe what you need to say.",
        href: "/tools/ai-email-writer/index.html",
        icon: "fa-wand-magic-sparkles",
        category: "ai",
        iconClass: "cat-ai",
        isNew: false,
        popular: true,
        addedOrder: 4
    },
    {
        name: "Invoice Generator",
        desc: "Create professional invoices with itemized billing and instant PDF download.",
        href: "/tools/invoice-generator/index.html",
        icon: "fa-file-invoice-dollar",
        category: "text",
        iconClass: "cat-text",
        isNew: false,
        popular: false,
        addedOrder: 5
    },
    {
        name: "Image Compressor",
        desc: "Shrink JPG, PNG and WebP files with a live quality preview — no quality surprises.",
        href: "/tools/image-compressor/index.html",
        icon: "fa-compress",
        category: "image",
        iconClass: "cat-image",
        isNew: false,
        popular: true,
        addedOrder: 6
    },
    {
        name: "Resume Builder",
        desc: "Build a clean, ATS-friendly resume with live preview and a sharp PDF export.",
        href: "/tools/resume-builder/index.html",
        icon: "fa-file-lines",
        category: "text",
        iconClass: "cat-text",
        isNew: false,
        popular: false,
        addedOrder: 7
    },
    {
        name: "Compress PDF",
        desc: "Shrink large PDF files with an adjustable quality slider — great for scanned documents.",
        href: "/tools/compress-pdf/index.html",
        icon: "fa-file-zipper",
        category: "pdf",
        iconClass: "cat-pdf",
        isNew: true,
        popular: true,
        addedOrder: 9
    },
    {
        name: "Cover Letter Generator",
        desc: "Write a clean, professional cover letter with live preview and instant PDF export.",
        href: "/tools/cover-letter/index.html",
        icon: "fa-envelope-open-text",
        category: "text",
        iconClass: "cat-text",
        isNew: true,
        popular: false,
        addedOrder: 10
    }
];