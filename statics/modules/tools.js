import Decimal from './decimal.mjs'

class IO {
    /**
     * 传入一个组名，返回一个 IO 对象，后续仅对该组内的数据进行读写
     * @param {string} scope 组名
     */
    constructor(scope) {
        this.scope = scope
    }

    /**
     * 读取一条数据
     * @param {string} id 数据的唯一标识符
     * @returns 该标识符所代表的数据
     */
    read(id) {
        let key = `${this.scope}/${id}`
        return localStorage.getItem(key)
    }

    /**
     * 写入一条数据
     * @param {string} id 数据的唯一标识符
     * @param {*} data 该标识符所代表的数据
     */
    write(id, data) {
        let key = `${this.scope}/${id}`
        localStorage.setItem(key, data)
    }

    /**
     * 删除一条数据
     * @param {string} id 数据的唯一标识符
     */
    remove(id) {
        let key = `${this.scope}/${id}`
        localStorage.removeItem(key)
    }

    /**
     * 列出已存储的所有数据的唯一标识符
     * @returns 当前组内所存储的所有数据的唯一标识符
     */
    listKeys() {
        let keys = []
        for (const key in localStorage) {
            if (Object.hasOwnProperty.call(localStorage, key) &&
                key.startsWith(this.scope)) {
                let i = key.indexOf('/') + 1
                keys.push(key.slice(i))
            }
        }
        return keys
    }

    /**
     * 确定是否需要收集 value
     * @param {*} value 当前值
     * @param {boolean} collectEmptyValue 是否收集空值
     * @returns
     */
    #checkValue = (value, collectEmptyValue) => {
        return collectEmptyValue || !(value === null || value === undefined || value == '')
    }

    /**
     * 检查 input 类型，若不是用户输入的内容（如 button 等），则不收集该 input 的数据
     * @param {*} type input 类型
     * @returns 是否需要收集该 input 的数据
     */
    #checkType = (type) => {
        let allows = [
            // 已列出所有的 input 类型，将不收集数据的类型注释掉即可
            // 'button',
            'checkbox',
            'color',
            'date',
            'datetime-local',
            'email',
            // 'file',
            // 'hidden',
            // 'image',
            'month',
            'number',
            // 'password',
            'radio',
            'range',
            // 'reset',
            'search',
            // 'submit',
            'tel',
            'text',
            'time',
            'url',
            'week'
        ]

        return allows.indexOf(type) != -1
    }

    /**
     * 从 input 控件收集用户填入的数据
     * @param {HTMLCollection | HTMLInputElement} inputs 需要收集数据的 input 标签
     * @param {boolean} collectEmptyValue 是否需要收集空值
     * @returns 收集的数据
     */
    collectData(inputs, collectEmptyValue = true) {
        if (inputs.length == 0) return

        let result = {
            timestamp: Date.now()
        }

        let safeKey = (key) => {
            return key.replaceAll('-', '_')
        }

        for (let input of inputs) {
            if (this.#checkType(input.type)) {
                // 需要分类型进行收集数据
                switch (input.type) {
                    case 'checkbox':
                        result[safeKey(input.name)] = input.checked
                        break
                    case 'radio':
                        if (input.checked) {
                            result[safeKey(input.name)] = input.value
                        }
                        break
                    default:
                        if (this.#checkValue(input.value, collectEmptyValue)) {
                            result[safeKey(input.name)] = input.value
                        }
                        break
                }
            }
        }
        return result
    }

    /**
     * 将 data 中的值自动填入到对应的 input 中
     * @param {Object} data 需要填入的数据
     * @param {HTMLCollection | HTMLInputElement} inputs 需要填入数据到哪些 input
     */
    exportData(data, inputs) {
        let reSafeKey = (key) => {
            return key.replaceAll('-', '_')
        }

        for (let item in data) {
            for (let input of inputs) {
                if (reSafeKey(input.name) == item) {
                    switch (input.type) {
                        case 'checkbox':
                            input.checked = data[item]
                            break
                        case 'radio':
                            if (input.value == data[item]) input.checked = true
                            break
                        default:
                            input.value = data[item]
                            break
                    }
                }
            }
        }
    }

}

class Formula {
    static AVERAGE(...array) {
        let sum = new Decimal(0)
        array.forEach((item) => sum = sum.plus(item))
        return sum.dividedBy(array.length)
    }

    // 计算相对标准偏差
    // Markdown 公式：$RSD = \frac{SD}{\overline{x}}*100\%$
    // @see Formula.STDEV()
    static RSD(...array) {
        let stdev = this.STDEV(...array)
        let average = () => {
            let sum = new Decimal(0)
            array.forEach(value => sum = sum.plus(new Decimal(value)))
            return sum.dividedBy(array.length)
        }

        let rsd = stdev.dividedBy(average()).times(100)
        return rsd.toPrecision(5)
    }

    // 计算标准偏差
    // Markdown 公式：$SD = \sqrt{\frac{\sum_{i=1}^{n}(x_i - \overline{x})^2}{n-1}}$
    static STDEV(...array) {
        // 计算所有数值的和
        let sum = new Decimal(0)
        array.forEach(value => sum = sum.plus(new Decimal(value)))

        // 计算所有数值的平均值
        let average = sum.dividedBy(array.length)

        // 计算 ((每个数值减去平均值)的二次方)的和，即公式中分子的结果
        let sumEach = new Decimal(0)
        array.forEach(value => {
            let v = new Decimal(value)
            let temp = v.minus(average).toPower(2)
            sumEach = sumEach.plus(temp)
        })

        // 以上结果除以 n-1 并开根号即得
        let x = sumEach.dividedBy(array.length - 1).squareRoot()
        return x
    }
}

class Deviation {
    static AbsoluteDeviation(num, nums) {
        // TODO: implement this method
    }
}

export { IO, Formula, Deviation }
