// This function strips out all the unwanted entries from postData
const helperFunctions = {
    validateBody: (allowedKeys, postData) => {
        let _temp = {};
        const extraKeys = Object.keys(postData).filter(x => Object.keys(allowedKeys).includes(x) === false);

        if (extraKeys.length != 0) {
            _temp["extra"] = extraKeys;
            return _temp;
        };

        for (const key in allowedKeys) {
            if (key in postData) {
                if (Array.isArray(allowedKeys[key].type)) {
                    const types = allowedKeys[key].type;

                    for (let j = 0; j < types.length; j++) {
                        if (types[j] === "array" && Array.isArray(postData[key]) === true) {
                            _temp[key] = postData[key];
                            break;
                            
                        } else if (typeof postData[key] === types[j]) {
                            _temp[key] = postData[key];
                            break;
    
                        } else {
                            // If the following key type has multiple types, only log an error when we have checked all types.
                            if (j + 1 < types.length) {
                                continue;
                            };

                            if ("error" in _temp) {
                                if (!_temp["error"].includes(key)) {
                                    _temp["error"].push(key);
                                };

                            } else {
                                _temp["error"] = [key];
                            };
                        };
                    };

                } else {
                    if (typeof postData[key] === allowedKeys[key].type) {
                        _temp[key] = postData[key];

                    } else {
                        if ("error" in _temp) {
                            if (!_temp["error"].includes(key)) {
                                _temp["error"].push(key);
                            };

                        } else {
                            _temp["error"] = [key];
                        };
                    };
                };

            } else {
                // If the following key type is not required, continue
                if (allowedKeys[key].required === undefined) {
                    continue
                };

                if ("missing" in _temp) {
                    _temp["missing"].push(key);
                } else {
                    _temp["missing"] = [key];
                };
            };
        };

        return _temp;
    },

    contains: (parentArray, childArray) => {
        return childArray.every(x => {
            return parentArray.includes(x)
        });
    },

    // Checks if an object is empty
    isEmpty: (obj) => {
        return Object.keys(obj).length === 0;
    },

    isObject: (obj) => {
        return obj === Object(obj);
    },

    documentExists: async (collection, query) => {
        return await collection.countDocuments(query);
    },

    getDistinct: (collection, query) => {
        return collection.distinct(query).exec();
    },

    getKey: (obj) => {
        var _temp = [];

        for ( var i = 0; i < obj.length; i++ ) {
            _temp.push( Object.keys(i) );
        };

        return _temp;
    },

    sanitise: function(obj) {
        var _temp = {};
        var isArray = false;

        // Checking if the obj is an Array
        if ( obj.constructor === Array ) {
            var _temp = [];
            var isArray = true;
        };

        for (var key in obj) {
            var value = obj[key];

            // Delete the first character if it's a $
            if ( typeof key === "string" && key.charAt(0) == "$" ) {
                key = key.slice(1);
            }

            if ( typeof value === "string" && value.charAt(0) == "$" ) {
                value = value.slice(1);
            } else if ( typeof value === "object" ) {
                value = helper_functions.sanitise(value);
            }

            if ( isArray ) {
                _temp.push(value);
            } else {
                _temp[key] = value;
            }
        };

        return _temp
    }
};

export default helperFunctions;
