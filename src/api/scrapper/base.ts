import { Request, Response, Router } from "express";
import {
  setMessage,
  paginationScrapperSearchPage,
  paginationScrapper,
} from "../../../helpers/global";
import _helper from "../../../middleware/helper";
import { get } from "../../../helpers/api_client";
import { load } from "cheerio";

class BaseScrapper {
  private _router = Router();
  private _uri = "http://www.priokport.co.id/ipc/home";
  private _cctv_uri="http://cctv.priokport.co.id";
  get router() {
    return this._router;
  }
  constructor() {
    this._configure();
  }
  private _configure() {
    this._router.get("/", async (req: Request, res: Response) => {
      try {
        const resp = await get(this._uri);
        let response: any = [];
        if (resp != "") {
          const $ = load(resp);
          $(".people").each(function (i, elem) {
            let data: any = {
              ship: $(this).find(".ship span").text().trim(),
              status: $(this).find(".ship small").text().trim(),
              image: $(this).find("img").attr("src"),
            };
            let origin: any = {};
            let destination: any = {};
            $(this)
              .find(".origin span")
              .each(function (ind, element) {
                if (ind == 0) {
                  origin.port = $(this).text().trim();
                } else {
                  origin.time = $(this).text().trim();
                }
              });
            $(this)
              .find(".destination span")
              .each(function (ind, element) {
                if (ind == 0) {
                  destination.port = $(this).text().trim();
                } else {
                  destination.time = $(this).text().trim();
                }
              });
            data.origin = origin;
            data.destination = destination;
            response.push(data);
          });

          return setMessage(res, 200, "Success get data", response);
        } else {
          return setMessage(res, 404, "Cannot get data", null);
        }
      } catch (error) {
        return setMessage(res, 400, "Terjadi kesalahan", error);
      }
    });
     this._router.get("/camera", async (req: Request, res: Response) => {
      try {
        const cctv_uri = this._cctv_uri
        const resp = await get(cctv_uri+'/public');
        let response: any = [];
        if (resp != "") {
          const $ = load(resp);
          $("figure").each(function (i, elem) {
            let data: any = {
              type: "image",
              name: $(this).find("figcaption").text().trim(),
              uri: cctv_uri+ $(this).find("img").attr("src"),
            };
           
            response.push(data);
          });

          return setMessage(res, 200, "Success get data", response);
        } else {
          return setMessage(res, 404, "Cannot get data", null);
        }
      } catch (error) {
        return setMessage(res, 400, "Terjadi kesalahan", error);
      }
    });
  }
}

export = new BaseScrapper().router;
