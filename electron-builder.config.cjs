module.exports = {
    appId: "io.bloxdblocks.editor",
    productName: "BloxdBlocks",
    directories: {
        output: "release-artifacts"
    },
    files: [
        "index.html",
        "bloxdcodetool.html",
        "bloxdcodetool.css",
        "bloxdcodetool.js",
        "style.css",
        "download.html",
        "download.css",
        "docs/**/*",
        "assets/**/*",
        "electron/main.cjs",
        "!assets/downloads/**"
    ],
    artifactName: "BloxdBlocks-Setup-v2.${ext}",
    win: {
        target: ["nsis"],
        fileAssociations: [
            {
                ext: "bb",
                name: "BloxdBlocks Block File",
                description: "BloxdBlocks workspace file",
                role: "Editor"
            }
        ]
    },
    nsis: {
        oneClick: false,
        perMachine: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true
    },
};
