import { vi } from 'vitest'
import jwt from 'jsonwebtoken'

process.env.NODE_ENV = 'testing'
process.env.TESTING = 'true'
process.env.PRODUCTION = ''
process.env.DB_IDENTIFIER = 'mysql'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3308'
process.env.DB_DATABASE = 'tokopaedi_test'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = 'test'
process.env.REDIS_HOST = '127.0.0.1'
process.env.RAJA_ONGKIR_URL = 'https://api.rajaongkir.com/starter'
process.env.RAJA_ONGKIR_API_KEY = 'mock_key'
process.env.REDIS_PORT = '6390'
process.env.REDIS_PASSWORD = ''
process.env.JWT_SECRET = 'tokopaedi-test-secret'
process.env.SUPER_ADMIN_LEVEL = '1'
process.env.EXPIRES_IN = '1h'

process.env.SUPER_ADMIN_JWT = jwt.sign(
  {
    id: 1,
    level: 1,
    authority: [100, 101, 102, 103, 104, 105],
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

vi.mock('cloudinary', () => {
  const upload_stream = (opts, cb) => {
    const callback = typeof opts === 'function' ? opts : cb
    const publicId = (typeof opts === 'object' && opts.public_id) || 'mock_public_id'
    if (callback) {
      callback(null, {
        public_id: publicId,
        secure_url: `https://res.cloudinary.com/test/image/upload/${publicId}.jpg`,
      })
    }
    return {
      end: () => {},
    }
  }

  const destroy = (public_id, options, cb) => {
    const callback = typeof options === 'function' ? options : cb
    if (callback) callback(null, { result: 'ok' })
    return Promise.resolve({ result: 'ok' })
  }

  return {
    v2: {
      config: () => {},
      uploader: {
        upload_stream,
        destroy,
      },
    },
  }
})

vi.mock('@helpers/ApiConfig/axios', () => {
  const provinces = [
    { province_id: '1', province: 'DKI Jakarta' },
    { province_id: '2', province: 'Jawa Barat' },
  ]

  const cities = [
    { city_id: '1', province_id: '1', city_name: 'Jakarta Utara', type: 'Kota', postal_code: '14110' },
    { city_id: '2', province_id: '2', city_name: 'Cirebon', type: 'Kota', postal_code: '45111' },
    { city_id: '3', province_id: '2', city_name: 'Indramayu', type: 'Kabupaten', postal_code: '45211' },
  ]

  const RajaOngkirApi = {
    get: vi.fn(async (url) => {
      if (url === '/province') {
        return { data: { rajaongkir: { results: provinces } } }
      }
      if (url === '/city') {
        return { data: { rajaongkir: { results: cities } } }
      }
      return { data: { rajaongkir: { results: [] } } }
    }),
    post: vi.fn(async (url) => {
      if (url === '/cost') {
        return {
          data: {
            rajaongkir: {
              results: [
                {
                  code: 'jne',
                  name: 'Jalur Nugraha Ekakurir (JNE)',
                  costs: [
                    {
                      service: 'JTR',
                      description: 'JNE Trucking',
                      cost: [{ value: 350, etd: '3-5', note: '' }],
                    },
                  ],
                },
              ],
            },
          },
        }
      }
      return { data: {} }
    }),
  }

  return { RajaOngkirApi }
})

vi.mock('../../helpers/ApiConfig/axios', () => {
  const provinces = [
    { province_id: '1', province: 'DKI Jakarta' },
    { province_id: '2', province: 'Jawa Barat' },
  ]

  const cities = [
    { city_id: '1', province_id: '1', city_name: 'Jakarta Utara', type: 'Kota', postal_code: '14110' },
    { city_id: '2', province_id: '2', city_name: 'Cirebon', type: 'Kota', postal_code: '45111' },
    { city_id: '3', province_id: '2', city_name: 'Indramayu', type: 'Kabupaten', postal_code: '45211' },
  ]

  const RajaOngkirApi = {
    get: vi.fn(async (url) => {
      if (url === '/province') {
        return { data: { rajaongkir: { results: provinces } } }
      }
      if (url === '/city') {
        return { data: { rajaongkir: { results: cities } } }
      }
      return { data: { rajaongkir: { results: [] } } }
    }),
    post: vi.fn(async (url) => {
      if (url === '/cost') {
        return {
          data: {
            rajaongkir: {
              results: [
                {
                  code: 'jne',
                  name: 'Jalur Nugraha Ekakurir (JNE)',
                  costs: [
                    {
                      service: 'JTR',
                      description: 'JNE Trucking',
                      cost: [{ value: 350, etd: '3-5', note: '' }],
                    },
                  ],
                },
              ],
            },
          },
        }
      }
      return { data: {} }
    }),
  }

  return { RajaOngkirApi }
})
