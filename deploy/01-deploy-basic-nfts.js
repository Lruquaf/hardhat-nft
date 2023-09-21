const {network} = require("hardhat")
const fs = require("fs")
const path = require("path")
const {networkConfig, developmentChains} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")
const {storeImages, storeMetadatas} = require("../utils/uploadToPinata")
const infos = require("../metadataInfos.json")

const imagesLocation = "./images/"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Attack",
            value: "",
        },
        {
            trait_type: "Defence",
            value: "",
        },
        {
            trait_type: "Administration",
            value: "",
        },
        {
            trait_type: "Morale",
            value: "",
        },
    ],
}

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    let tokenUris
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
        console.log("Token URIs are ready!")
    }
    if (!developmentChains.includes(network.name)) {
        tokenUris = networkConfig[chainId].tokenUris
    }

    console.log("-----------------------------------------------")

    const basicNfts = await deploy("BasicNFTs", {
        from: deployer,
        args: [tokenUris],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(basicNfts.address, [tokenUris])
    }
    console.log("Token contract was deployed!")
}

async function handleTokenUris() {
    tokenUris = []
    const {responses: imageUploadResponses, files} = await storeImages(
        imagesLocation
    )
    const jsonInfos = infos
    // console.log(jsonInfos)
    console.log("Metadatas are uploading to Pinata...")
    for (index in imageUploadResponses) {
        let metadata = {...metadataTemplate}
        metadata.name = jsonInfos.infos.name[index]
        metadata.description = jsonInfos.infos.description[index]
        for (let i = 0; i < 4; i++) {
            metadata.attributes[i].value = jsonInfos.infos.attributes[index][i]
        }
        metadata.image = `ipfs://${imageUploadResponses[index].IpfsHash}`
        console.log(`Working on ${metadata.name}`)
        const metadataUploadResponse = await storeMetadatas(metadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)

        const jsonFileName = `../metadatas/${files[index].replace(
            ".png",
            ""
        )}.json`
        const jsonFilePath = path.join(
            __dirname,
            "..",
            "metadatas",
            jsonFileName
        )

        if (fs.existsSync(jsonFilePath)) {
            fs.writeFileSync(
                jsonFilePath,
                JSON.stringify(metadata, null, 2),
                "utf-8"
            )
        } else {
            fs.writeFileSync(
                jsonFilePath,
                JSON.stringify(metadata, null, 2),
                "utf-8"
            )
        }
    }
    console.log("Metadatas uploaded to Pinata!")

    // console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "basicNfts"]
