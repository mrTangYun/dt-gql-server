function strTypeToGqlType(str) {
    switch (str) {
        case 'str':
            return 'String';
        case 'float':
            return 'Float';
        case 'int':
            return 'Int';
        default:
            throw new Error('未处理的类型');
    }
}
function stringToType(str, includeDefault = true) {
    const fields = str.split('\n');
    const outArray = fields.filter(item => item).map(field => {
        // console.log(field);
        let reg;
        if (includeDefault) {
            reg = /([^\s]+)\s+([^\s]+)\s+\w+\s+([^$]+)$/;
        } else {
            reg = /([^\s]+)\s+([^\s]+)\s+([^$]+)$/
        }
        const match = field.trim().match(reg);
        // console.log(match);
        return `
            """${match[3]}"""
            ${match[1]}: ${strTypeToGqlType(match[2])}
        `;
    });
    // console.log();
    return [`
            id: String
        `,
        ...outArray].join('');
}

function stringToInputArgsType(str) {
    const fields = str.split('\n');
    const outArray = fields.filter(item => item).map(field => {
        // console.log(field);
        let reg;
        reg = /([^\s]+)\s+([^\s]+)\s+(\w+)\s+([^$]+)$/;
        const match = field.trim().match(reg);
        return `
            """${match[4]}"""
            ${match[1]}: ${strTypeToGqlType(match[2])}${match[3]==='Y' ? '!' : ''}
        `;
    });
    // console.log();
    return outArray.join('');
}

const typeDefs = `
  """交易日历, 获取各大交易所交易日历数据,默认提取的是上交所"""
  type TradeCalResult {
    ${stringToType(`exchange	str	交易所 SSE上交所 SZSE深交所
        cal_date	str	日历日期
        is_open	int	是否交易 0休市 1交易
        pretrade_date	str	上一个交易日`, false)}
  }  
  """股票列表"""
  type StockBasicResult {
    ${stringToType(`ts_code	str	TS代码
        symbol	str	股票代码
        name	str	股票名称
        area	str	所在地域
        industry	str	所属行业
        fullname	str	股票全称
        enname	str	英文全称
        market	str	市场类型 （主板/中小板/创业板）
        exchange	str	交易所代码
        curr_type	str	交易货币
        list_status	str	上市状态： L上市 D退市 P暂停上市
        list_date	str	上市日期
        delist_date	str	退市日期
        is_hs	str	是否沪深港通标的，N否 H沪股通 S深股通`, false)}
  }
  
  """日线行情"""
  type DailyResult {
    ${stringToType(`ts_code	str	股票代码
trade_date	str	交易日期
open	float	开盘价
high	float	最高价
low	float	最低价
close	float	收盘价
pre_close	float	昨收价
change	float	涨跌额
pct_chg	float	涨跌幅
vol	float	成交量 （手）
amount	float	成交额 （千元）`, false)}
  }
  """周线行情"""
  type WeeklyResult {
    ${stringToType(`ts_code	str	Y	股票代码
        trade_date	str	Y	交易日期
        close	float	Y	周收盘价
        open	float	Y	周开盘价
        high	float	Y	周最高价
        low	float	Y	周最低价
        pre_close	float	Y	上一周收盘价
        change	float	Y	周涨跌额
        pct_chg	float	Y	周涨跌幅
        vol	float	Y	周成交量
        amount	float	Y	周成交额`)}
  }
  """tuShare相关接口"""
  type tuShareApiType {
    trade_cal: TradeCalResult,
    stock_basic: [StockBasicResult],
    weekly(${stringToInputArgsType(`ts_code	str	N	TS代码 （ts_code,trade_date两个参数任选一）
trade_date	str	N	交易日期 （每周五日期，YYYYMMDD格式）
start_date	str	N	开始日期
end_date	str	N	结束日期`)}): [WeeklyResult],
    daily(${stringToInputArgsType(`ts_code	str	N	股票代码（二选一）
trade_date	str	N	交易日期（二选一）
start_date	str	N	开始日期(YYYYMMDD)
end_date	str	N	结束日期(YYYYMMDD)`)}): [DailyResult]
  }
`;
module.exports = {
    tuShareApiType: typeDefs
};