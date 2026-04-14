/**
 * IndexedDB 通用工具封装
 * 提供对 IndexedDB 的 Promise 化操作，支持初始化、CRUD 及索引查询
 */

const DB_NAME = 'bmw-4s-db'
let dbVersion = 1
let dbInstance = null
// 注册所有仓库配置，新仓库注册时自动升级版本
const storeConfigs = {}

/**
 * 初始化数据库，创建对象仓库和索引
 * 支持多仓库：每个新仓库会自动触发版本升级
 * @param {string} storeName - 对象仓库名称
 * @param {Object} [options] - 配置项
 * @param {string} options.keyPath - 主键字段，默认 'id'
 * @param {Array<{name: string, keyPath: string, options?: IDBIndexParameters}>} [options.indexes] - 索引列表
 * @returns {Promise<IDBDatabase>}
 */
export function initDB(storeName, options = {}) {
    // 注册新仓库配置，并递增版本号以触发 onupgradeneeded
    if (!storeConfigs[storeName]) {
        storeConfigs[storeName] = options
        dbVersion++
        dbInstance = null
    }

    if (dbInstance) {
        return Promise.resolve(dbInstance)
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, dbVersion)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            // 遍历所有已注册的仓库，确保每个都创建
            for (const [name, opts] of Object.entries(storeConfigs)) {
                if (!db.objectStoreNames.contains(name)) {
                    const store = db.createObjectStore(name, {
                        keyPath: (opts && opts.keyPath) || 'id'
                    })
                    if (opts && opts.indexes) {
                        opts.indexes.forEach(idx => {
                            store.createIndex(idx.name, idx.keyPath, idx.options || {})
                        })
                    }
                }
            }
        }

        request.onsuccess = (event) => {
            dbInstance = event.target.result
            resolve(dbInstance)
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    })
}

/**
 * 获取事务中的对象仓库
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @returns {IDBObjectStore}
 */
function getStore(db, storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName)
}

/**
 * 获取所有数据
 * @param {string} storeName
 * @returns {Promise<Array>}
 */
export async function getAll(storeName) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName).getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

/**
 * 根据 ID 获取单条数据
 * @param {string} storeName
 * @param {*} id
 * @returns {Promise<*|undefined>}
 */
export async function getById(storeName, id) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName).get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

/**
 * 新增数据
 * @param {string} storeName
 * @param {Object} data
 * @returns {Promise<*>}
 */
export async function add(storeName, data) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName, 'readwrite').add(data)
        request.onsuccess = () => resolve(data)
        request.onerror = () => reject(request.error)
    })
}

/**
 * 更新数据
 * @param {string} storeName
 * @param {Object} data
 * @returns {Promise<*>}
 */
export async function update(storeName, data) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName, 'readwrite').put(data)
        request.onsuccess = () => resolve(data)
        request.onerror = () => reject(request.error)
    })
}

/**
 * 删除数据
 * @param {string} storeName
 * @param {*} id
 * @returns {Promise<void>}
 */
export async function remove(storeName, id) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName, 'readwrite').delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

/**
 * 清空所有数据
 * @param {string} storeName
 * @returns {Promise<void>}
 */
export async function clear(storeName) {
    const db = await initDB(storeName)
    return new Promise((resolve, reject) => {
        const request = getStore(db, storeName, 'readwrite').clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}
