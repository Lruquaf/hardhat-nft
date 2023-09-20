const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY || ""
const pinataApiSecret = process.env.PINATA_API_SECRET || ""
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    // console.log(files)
    let responses = []
    console.log("Images are uploading to Pinata...")
    for (index in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[index]}`
        )
        const options = {
            pinataMetadata: {
                name: files[index],
            },
        }
        console.log(`Working on ${files[index]}`)
        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options
            )
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    console.log("Images uploaded to Pinata!")
    return {responses, files}
}

async function storeMetadatas(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    }
    try {
        const response = await pinata.pinJSONToIPFS(metadata, options)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = {storeImages, storeMetadatas}
