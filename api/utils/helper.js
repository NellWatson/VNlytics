// This function strips out all the unwanted entries from postData
const helperFunctions = {
    validatePost: function(allowedKeys, postData) {
        var _temp = {};

        for ( var i = 0; i < allowedKeys.length; i++ ) {
            var key = allowedKeys[i];

            if (key in postData) {
                _temp[key] = postData[key];
            }
        }

        return _temp
    },

    // Checks if an object is empty
    isEmpty: function(obj) {
        return Object.keys(obj).length === 0;
    },

    isObject: function(obj) {
        return obj === Object(obj);
    },

    documentExists: async (collection, query) => {
        return await collection.countDocuments(query);
    },

    getDistinct: function(collection, query) {
        return collection.distinct( query ).exec();
    },

    getKey: function(obj) {
        var _temp = [];

        for ( var i = 0; i < obj.length; i++ ) {
            _temp.push( Object.keys(i) );
        }

        return _temp
    },

    sanitise: function(obj) {
        var _temp = {};
        var isArray = false;

        // Checking if the obj is an Array
        if ( obj.constructor === Array ) {
            var _temp = [];
            var isArray = true;
        }

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
        }

        return _temp
    }
};

export default helperFunctions;
