const { RESTDataSource } = require('apollo-datasource-rest');

const token = "297852bb31038cdc33cd9a2d9e5c582a915a88811ab5a53eb77c3b64";
class MoviesAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://api.tushare.pro/';
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