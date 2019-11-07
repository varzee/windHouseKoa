const mongoose = require('mongoose')
const DB_NAME = 'windhouse'
const DB_URL = `mongodb+srv://varzee:-random1@varzee-tldwp.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

const connection = mongoose.createConnection(
  DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
   }
)
connection.on('open', () => {
  console.log('数据库已连接！');
})
connection.on('err', (err) => {
	console.log('数据库连接错误: \n',err);
})

module.exports = connection