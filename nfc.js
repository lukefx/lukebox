const { NFC } = require('nfc-pcsc')
const request = require('request')

const sonos = 'http://localhost:5005/Dining Room'

const nfc = new NFC()

nfc.on('reader', reader => {
	console.log(`${reader.reader.name}  device attached`)
	reader.on('card', async card => {
		// Buffer data: raw data from select APDU response
    // console.log(`${reader.reader.name}  card detected`, card)
    const dataBuffer = await reader.read(4, 81);
    const startOfMessage = 5 // header size is 5 byte
		const endOfMessage = dataBuffer.indexOf(254)
    const parsed = dataBuffer
      .slice(startOfMessage, endOfMessage)
      .toString('utf8')
      .replace('\0', '')

		if (parsed.startsWith('U')) {
			// It's an URI
      const playlist = parsed.substring(1)
      // request(`${sonos}/say/ok`)
      request(`${sonos}/spotify/now/${playlist}`, (error, response, body) => {
        if (error) {
          console.log(error)
        }
        console.log(response)
      })
		} else {
			// It's a raw data
			console.log('RAW', parsed)
		}
	});

	reader.on('card.off', card => {
    // console.log(`${reader.reader.name}  card removed`, card);
	});

	reader.on('error', err => console.log(`${reader.reader.name}  an error occurred`, err))

})

nfc.on('error', err => console.log('an error occurred', err))
