const { RESTDataSource } = require('apollo-datasource-rest');
const fs = require('fs');
const path = require('path');
const csv = require("fast-csv");

const token = "297852bb31038cdc33cd9a2d9e5c582a915a88811ab5a53eb77c3b64";

let DATACSV;
class MoviesAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://api.tushare.pro/';
    }

    getData() {
        return new Promise((resolve, reject) =>{
            const dataCsv = {
                titles: [],
                dates: [],
                data: []
            };
            csv.fromPath(path.resolve("api/tushare/Weight_ETF_Data_Weekly_2018_9_14_dolphinDB.csv")).on("data", data => {
                if (dataCsv.titles.length === 0) {
                    data.map((item, index) => {
                        if (index) {
                            dataCsv.titles.push(item);
                        }
                    });
                } else {
                    const [date, ...datas] = data;
                    dataCsv.dates.push(date);
                    dataCsv.data.push([...datas.map(item => item.toString())]);
                }
            }).on("end", () => {
                resolve(dataCsv);
            });
        })
    }

    async getCSVData() {
        if (DATACSV) return DATACSV;
        DATACSV = await this.getData();
        return DATACSV;
    };

    async fetchApi(apiName, args, fields) {
        const result = await this.post('/',
            {
                "api_name": apiName,
                "token": token,
                "params": {
                    ...args
                },
                "fields": fields
            });
        const {code, msg, data} = result;
        if (code !== 0) {
            throw new Error(`apiName: ${apiName}, code: ${code}, msg: ${msg}`);
        }
        return data;
    }

    async trade_cal() {
        return await this.post('/',
            {
                "api_name": "trade_cal",
                "token": token,
                "params": {
                    "exchange":"",
                    "start_date":"20180901",
                    "end_date":"20181001",
                    "is_open":"0"
                },
                "fields": "exchange,cal_date,is_open,pretrade_date"
            });
    }

    async stock_basic() {
        const result = await this.post('/',
            {
                "api_name": "stock_basic",
                "token": token,
                "params": {
                },
                "fields": "ts_code, name"
            });
        // console.log(result.data.items);
        return result.data.items.map(([ts_code, name]) => ({
            ts_code, name
        }));
    }

    willSendRequest(request) {
        // request.headers.set('Authorization', this.context.token);
    }


    async getMovie(id) {
        return this.get(`movies/${id}`);
    }

    // an example making an HTTP POST request
    async postMovie(movie) {
        return this.post(
            `movies`, // path
            movie, // request body
        );
    }

    // an example making an HTTP PUT request
    async newMovie(movie) {
        return this.put(
            `movies`, // path
            movie, // request body
        );
    }

    // an example making an HTTP PATCH request
    async updateMovie(movie) {
        return this.patch(
            `movies`, // path
            { id: movie.id, movie }, // request body
        );
    }

    // an example making an HTTP DELETE request
    async deleteMovie(movie) {
        return this.delete(
            `movies/${movie.id}`, // path
        );
    }
}

// export default MoviesAPI;
module.exports = {
    MoviesAPI
};