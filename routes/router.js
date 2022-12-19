const express = require("express");
const router = express.Router();
require("dotenv").config();

//Using node-cache npm package for Cache
const NodeCache = require("node-cache");
const myCache = new NodeCache({stdTTL: 100});

//Importing google-cloud/translate api
const { Translate } = require("@google-cloud/translate").v2;

//Fetching projectId and credentials
const projectId = process.env.PROJECT_ID;
const credentials = JSON.parse(process.env.CREDENTIALS);

// Instantiates a client
const translate = new Translate({ credentials, projectId });

//Getting translated text
router.get("/translate", async (req, res) => {
  //Extracting query parameters from url
  const queryParams = req.query;
  const searchText = queryParams.text;
  const targetLanguageCode = queryParams.targetLanguage;

  try {
    //Fetching all the languages supported by api
    const [languages] = await translate.getLanguages();

    //Fetching all the language codes
    const languageCodes = languages.map((language) => language.code);

    //Validating language code send by user
    if (languageCodes.includes(targetLanguageCode)) {

      //Getting cache response if data is stored in cache with keyName = chacheData
      const cacheRes = myCache.get("cacheData");

      //Checking if cacheRes is undefined then Translated data will be stored in cache
      if (cacheRes === undefined) {
        //Translating searchedText into target language
        const [translation] = await translate.translate(
          searchText,
          targetLanguageCode
        );

        //sending response
        res.status(200).json({
          text: searchText,
          targetLanguageCode: targetLanguageCode,
          translatedText: translation,
        });

        //Setting cache with keyName cacheData
       let success =  myCache.set("cacheData", {
          text: searchText,
          targetLanguageCode: targetLanguageCode,
          translatedText: translation,
        });

      } else {
        // console.log(cacheRes);
        //Sending response if data is already exist in cache
        res.status(200).json(cacheRes);
      }
    } else {
      res.status(400).json({ message: "Please enter valid language code" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
