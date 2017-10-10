var   waitOnCondition = function(params) {

        // define function type-check
        // ** Move this to a sub-routine lib
        var isFunction = function(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        };

        // Type-check Inputs

        // scope self
        var self = this;

        // initialize variables
        self.delay = null;
        self.loopCount = 0;
        self.loopLimit = null;
        self.callback = null;
        self.exit = null;
        self.startTime = new Date();
        self.endTime = null;
        self.timer = null;
        self.debug = false;

        // map variables from params to self
        if (params.exit) {
            self.exit = params.exit;
        }
        if (params.selectionType) {
            self.selectionType = params.selectionType;
        }
        if (params.selection) {
            self.selection = params.selection;
        }
        if (params.loopLimit) {
            self.loopLimit = params.loopLimit;
        }
        if (params.delay) {
            self.delay = params.delay;
        }
        if (params.callback) {
            self.callback = params.callback;
        }
        if (params.name) {
            self.name = params.name;
        }
        if (params.debug) {
            self.debug = params.debug;
        }

        // define debug logger
        self.debugLog = function(input) {
            if (!self.debug) {
                return;
            } else {
                console.log('loop debug at ' + new Date() + ': ' + input);
            }
        };
        // define checkExists handlers for booleans, jquery selections, non-empty strings, and load template
        self.testBoolean = function() {
            if (self.selection) {
                return true;
            }
        };
        self.testJquerySelection = function() {
            if ($(self.selection).length > 0) {
                return true;
            }
        };
        self.testNonEmptyString = function() {
            self.debugLog('Testing NonEmpty String');
            var test = self.selection.length;
            self.debugLog('Test Value: ' + test);
            if (test > 0) {
                return true;
            }
        };
        self.testLoadTemplate = function() {
            self.debugLog('testing Load Template');
            // A counter keeps track of how many dependencies have loaded
            var test = self.selection.masterCount <= self.selection.currentCount;
            self.debugLog('Test Value: ' + test);
            if (test) {
                return true;
            }
        };

        // Choose checkExists handler based on 'selectionType'
        /* Manually de-stringify selection input to allow it to access the global variable it is
         * intended to reference. Attempting to pass the variable name, unstringified, right into 
         * the parameters actually only passes in its value at the time, which makes it a poor
         * check for the current actual value of the global.
         */

        // if selection is a jQuery Selection, pass that in as a string 

        self.parseSelection = function(callback) {
            if (self.selectionType === 'booleanVariable') {
                self.debugLog('found boolean');
                if (self.selection === 'siteType') {
                    var stringStore = self.selection;
                    self.selection = siteType;
                    if (self.testBoolean()) {
                        return true;
                    } else {
                        self.selection = stringStore;
                    }
                } else if (self.selection === 'loadNavToolsListDone') {
                    var stringStore = self.selection;
                    self.selection = loadNavToolsListDone;
                    if (self.testBoolean()) {
                        return true;
                    } else {
                        self.selection = stringStore;
                    }
                } else if (self.selection === 'loadPageBannerDone') {
                    var stringStore = self.selection;
                    self.selection = loadPageBannerDone;
                    if (self.testBoolean()) {
                        return true;
                    } else {
                        self.selection = stringStore;
                    }
                } else if (self.selection === 'loadNavDelListDone') {
                    var stringStore = self.selection;
                    self.selection = loadNavDelListDone;
                    if (self.testBoolean()) {
                        return true;
                    } else {
                        self.selection = stringStore;
                    }
                }
            }
            if (self.selectionType === 'nonEmptyString') {
                self.debugLog('found string');
                if (self.selection === 'siteType') {
                    var stringStore = self.selection;
                    self.selection = siteType;
                    if (self.testNonEmptyString()) {
                        return true;
                    } else {
                        self.selection = stringStore;
                    }
                }
            }
            if (self.selectionType === 'domElement') {
                self.debugLog('found dom element');
                if (self.testJquerySelection()) {
                    return true;
                }
            }
        };

        // Check if the testVariable meets an exit condition
        // This is the Exit Condition of the Safe Loop
        // ** This could live in a sub-routine lib:
        self.checkExists = function(selection) {
            /*if( typeof selection !== 'string'){
                throw new Error('selections, whether boolean or dom element, need to be entered as Strings');   
            }*/
            if (self.selectionType === 'booleanVariable') {
                if (self.parseSelection(self.testBoolean)) {
                    return true;
                }
            }
            if (self.selectionType === 'domElement') {
                if (self.parseSelection(self.testJquerySelection)) {
                    return true;
                }
            }
            if (self.selectionType === 'nonEmptyString') {
                if (self.parseSelection(self.testNonEmptyString)) {
                    return true;
                }
            }
            if (self.selectionType === 'pageTemplate') {
                if (self.parseSelection(self.testLoadTemplate)) {
                    return true;
                }
            }
        };

        self.exit = self.checkExists;

        function recur(callback) {
            if (callback) {
                // Set Timeout
                self.timer = setTimeout(callback, self.delay);
            }
        }

        (function loop(params) {
            self.debugLog('entering loop for ' + self.name);


            self.loopCount += 1;

            // console.log('loop iteration ' + self.loopCount);
            // console.log('loop test variable value: ' + self.testVariable);

            // self.exit accepts params
            //      selection: String
            if (self.exit(self.selection)) {
                self.debugLog(' exiting');
                self.endTime = new Date() - self.startTime;
                self.callback();
                self.debugLog('\n' + self.selection + ' was found without a null or empty string value after ' + self.loopCount + ' attempts taking a total of ' + self.endTime + ' milliseconds');
            } else {
                if (self.loopCount > self.loopLimit) {
                    self.debugLog(' exiting');
                    self.endTime = new Date() - self.startTime;
                    self.debugLog('\n' + self.selection + ' was NOT FOUND or was found with a value of null or empty string after ' + self.loopCount + ' attempts taking a total of ' + self.endTime + ' milliseconds');
                    return;
                }
                if (self.timer !== null) {
                    // Clear Timeout
                    clearTimeout(self.timer);
                    self.timer = null;
                    recur(loop, self.name);
                } else {
                    // if this is the first time going through the loop, 
                    // there is no need to clear the timeout
                    recur(loop, self.name);
                }
            }
        })();
    };

var SynchronousFlowBlock = function(params) {
    // Type-check Inputs

    // Make sure all params are expected ones
    for (var prop in params) {
        if (prop !== 'name' && prop !== 'methods' && prop !== 'callback' && prop !== 'selectionType' && prop !== 'selection' && prop !== 'debug') {
            throw new Error('You have to use valid properties to initialize this method');
        }
    }
    if (typeof params.selection !== 'string') {
        throw new Error('selections, whether nonEmptyString, boolean or dom element, need to be entered as Strings');
    }
    if (params.debug) {
        if (typeof params.debug !== 'boolean') {
            throw new Error('"debug" is a boolean property');
        }
    }

    var name = params.name;
    var methods = params.methods;
    var selectionType = params.selectionType;
    var selection = params.selection;
    var callback = params.callback;

    // debug is false by default
    var debug = params.debug || false;

    // fire all the methods
    $.each(methods, function(index, value) {
        value();
    });
    // wait to fire the next Flow Block until a 
    // selection's value meets an exit condition
    var loop = new Loop({
        name: name,
        delay: 100,
        loopLimit: 30,
        selectionType: selectionType,
        selection: selection,
        callback: callback,
        debug: debug
    });
}

module.exports.waitOnCondition = waitOnCondition;
module.exports.SynchronousFlowBlock = SynchronousFlowBlock;