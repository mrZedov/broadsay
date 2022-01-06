const NUM_PAGES_RESPONSE = 5    // количество страниц, сколько нужно получить от gorest

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const axios = require("axios")

const app = express(feathers());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.use(express.errorHandler());
app.listen(3030)
	.on('listening', () => console.log('Feathers started at localhost:3030'));

class Data {
	constructor(endpoint) {         // инициализируем массив, где будут лежать данные
		this.data = [];             // после получения с gorest
		this.endpoint = endpoint    // endpoint
	}

	async getData(page){
		const startPages = 1*page   // номер страницы из запроса, конвертируем в число
		const data = []             // очищаем массив data
		for(let i=startPages; i<startPages+NUM_PAGES_RESPONSE; i++){
			await axios({
				url: `https://gorest.co.in/public/v1/${this.endpoint}?page=${i}`,
				method: 'get'
			}).then((response) => {
				data.push(...response.data.data);   // заполняем очередной порцией 20шт от gorest
			})
		}
		return data     // возвращаем весь массив из 100 элементов
	}

	async find(params) {
		// отдаем список всех данных
		return this.data;
	}

	async create(data, params) {
		const startPages = 1*params.query.page  // номер страницы из параметра
		this.data = await this.getData(startPages); // получить 100 элементов по соответсвующему endpoint
		return this.data    // отдать в ответ запроса
	}
}

const users = new Data('users') // соответсвующие endpoint
const posts = new Data('posts')

app.use('users', users);
app.use('posts', posts);
