import * as functions from 'firebase-functions'
import * as admin from "firebase-admin"
import { IGetSongDetailsInput, IGetSongDetailsOutput } from '../../models/functions';
import { ISong } from "../../models/firestore"

module.exports = functions
  .region('asia-northeast1')
  .runWith({ memory: "512MB" })
  .https
  .onCall(async (data: IGetSongDetailsInput, context) => {
    console.debug("checkData")
    if (checkData(data, context) === false) {
      throw new Error("bad request")
    }

    console.debug("dataFromCode")
    const dataFromCode = await getDataFromCode(data.type, data.code)
    if (dataFromCode.exist) {
      return {
        id: dataFromCode.ref!.id,
        song: dataFromCode.song,
        artist: dataFromCode.artist
      } as IGetSongDetailsOutput
    }

    // TODO: 404の場合にfalseを返す
    console.debug("dataFromWeb")
    const dataFromWeb = await getDataFromWeb(data.type, data.code)

    console.debug("dataFromDetails")
    const dataFromDetails = await getDataFromDetails(dataFromWeb.song, dataFromWeb.artist)
    if (dataFromDetails.exist) {
      if (typeof dataFromDetails.ref === "undefined") {
        throw new Error("dataFromDetails.ref is undefined")
      }

      console.debug("updateData")
      updateData(dataFromDetails.ref, {
        code: data.type === "dam" ? { dam: data.code } : { joysound: data.code }
      })
        .catch((error) => {
          throw new Error(error)
        })

      return {
        id: dataFromDetails.ref!.id,
        song: dataFromDetails.song,
        artist: dataFromDetails.artist
      } as IGetSongDetailsOutput
    }

    console.debug("addData")
    return addData({
      code: data.type === "dam" ? { dam: data.code } : { joysound: data.code },
      song: dataFromWeb.song,
      artist: dataFromWeb.artist
    })
      .then((ref) => {
        return {
          id: ref.id,
          song: dataFromWeb.song,
          artist: dataFromWeb.artist
        } as IGetSongDetailsOutput
      })
      .catch((error) => {
        throw new Error(error)
      })
  })

const checkData = (data: IGetSongDetailsInput, context: functions.https.CallableContext) => {
  if (typeof context.auth !== "object") {
    return false
  }
  if (typeof data.type !== "string" || ["dam", "joysound"].includes(data.type) === false) {
    return false
  }
  if (typeof data.code !== "string" || data.code.length !== 6) {
    return false
  }
  return true
}

const getDataFromCode = async (type: "dam" | "joysound", code: string) => {
  const docs = await admin.firestore()
    .collection("songs")
    .where(`code.${type}`, '==', code)
    .get()
  const doc = docs.docs[0]
  if (docs.empty) {
    return { exist: false }
  }
  const data = doc.data()
  return { exist: true, ref: doc.ref, song: data.song, artist: data.artist }
}

const getDataFromDetails = async (song: string, artist: string) => {
  const docs = await admin.firestore()
    .collection("songs")
    .where("song", "==", song)
    .where("artist", "==", artist)
    .get()
  const doc = docs.docs[0]
  if (docs.empty) {
    return { exist: false }
  }
  const data = doc.data()
  return { exist: true, ref: doc.ref, song: data.song, artist: data.artist }
}

const getDataFromWeb = async (type: "dam" | "joysound", code: string) => {
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({ args: ['--no-sandbox', "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  const details = {
    song: "",
    artist: ""
  }
  if (type === "dam") {
    await page.goto(`https://www.clubdam.com/karaokesearch/songleaf.html?requestNo=${code.substr(0, 4)}-${code.substr(4)}`);
    details.song = await page.$eval(".song-name", (item: Element) => {
      return item.textContent;
    })
    details.artist = await page.$eval(".artist-name > a", (item: Element) => {
      return item.textContent;
    })
  }
  if (type === "joysound") {
    await page.goto(`https://cse.google.com/cse?cx=000614101137887689996:_nkbbf_g6ls&q=joysound ${code}`)
    const songUrl = await page.$eval(".gs-visibleUrl-long", (item: Element) => {
      return item.textContent;
    })
    await page.goto(songUrl)
    details.song = await page.$eval("span.ng-binding:nth-child(4)", (item: Element) => {
      return item.textContent;
    })
    details.artist = await page.$eval("a.ng-binding:nth-child(3)", (item: Element) => {
      return item.textContent;
    })
  }
  await browser.close();
  return details
}

const addData = (data: ISong) => {
  return admin.firestore().collection("songs").add(data)
}

const updateData = (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>, data: ISong) => {
  return ref.set(data, { merge: true })
}
