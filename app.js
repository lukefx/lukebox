const { NFC } = require('nfc-pcsc')
const { DeviceDiscovery, SpotifyRegion } = require('sonos')
const ndef = require('ndef')

const nfc = new NFC()
let device = null

DeviceDiscovery().on('DeviceAvailable', async sonos => {
  sonos.setSpotifyRegion(SpotifyRegion.EU)
  device = sonos
})

nfc.on('reader', reader => {
	console.log(`${reader.reader.name}  device attached`)

  reader.on('card', async card => {

		// Buffer data: raw data from select APDU response
    console.log(`${reader.reader.name} card detected`, card)
    const dataBuffer = await reader.read(4, 100)
    const start = 5 // header size is 5 byte
		const end = dataBuffer.indexOf(254)
    const commands = dataBuffer
      .slice(start, end)
      .toString('utf8')
      .replace('\0', '')

		if (commands.startsWith('U')) {
			// It's an URI
      const playlist = commands.substring(1)
      if (device) {
        try {
          const playerState = await device.getCurrentState()
          await device.selectQueue()
          await device.play(playlist)
        } catch (err) {
          console.log(err)
        }
      }
    } else if (commands.startsWith('C')) {
      // It's a custom command
      const command = commands.substring(1)
      switch (command) {
        case 'next':
          device.next()
          break
        case 'previous':
          device.previous()
          break
        default:
          break
      }
		} else {
			// It's a raw data
			console.log('RAW', commands)
    }

	})

	reader.on('error', err => console.log(`${reader.reader.name}  an error occurred`, err))

})
