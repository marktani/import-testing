const Bluebird = require('bluebird')
const _ = require('lodash')
const { GraphQLClient } = require('graphql-request')

const client = new GraphQLClient(process.env['PRISMA_ENDPOINT'], { })

const generateArticle = () => {
  const random = Math.random().toString(36).substring(7)
  const connectString = process.env.CONNECT === 'TRUE' ? 'source: { connect: { slug: "test" } }': ''

  return `
    k_${random}: createArticle(
      data: {
        featuredImage: "http://example.com"
        summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        publishedAt: "2017-02-02"
        url: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ${connectString}
      }
    ) {
      id
    }
  `
}

const upsertSource = async(slug) => {
  const query = `
    mutation {
      upsertSource(
        where: {
          slug: "${slug}"
        }
        create: {
          slug: "${slug}"
        }
        update: {
          
        }
      ) {
        id
        slug
      }
    }
  `

  const response = await client.request(query)
  return
}

const createArticles = async(articles) => {
  const mutations = _.chain(articles)
  .chunk(process.env.BATCH_SIZE)
  .map(chunk => `
    mutation {
      ${chunk.join('\n')}
    }
  `)
  .value()

  await Bluebird.map(mutations, mutation => client.request(mutation), {concurrency: parseInt(process.env.CONCURRENCY, 1)})
}

const main = async() => {
  printConfiguration()

  // generate articles
  const articles = _.range(process.env.COUNT).map(generateArticle)

  // upsert source
  await upsertSource('test')

  // create articles
  await createArticles(articles)

  console.log('Done!')
}

const printConfiguration = () => {
  console.log(`Count:                 ${process.env.COUNT}`)
  console.log(`Batch size:            ${process.env.BATCH_SIZE}`)
  console.log(`Concurrency:           ${process.env.CONCURRENCY}`)
  console.log('')
}

main().catch((e) => console.error(e))