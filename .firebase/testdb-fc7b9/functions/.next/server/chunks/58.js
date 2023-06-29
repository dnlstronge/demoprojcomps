exports.id = 58;
exports.ids = [58];
exports.modules = {

/***/ 6814:
/***/ ((module) => {

// Exports
module.exports = {
	"container": "PanelSection_container__fUMlh",
	"inputSection": "PanelSection_inputSection__vnd_O",
	"input": "PanelSection_input__l8l_2",
	"prevBtn": "PanelSection_prevBtn__3DGGD",
	"iframe": "PanelSection_iframe__YHV8w"
};


/***/ }),

/***/ 58:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6814);
/* harmony import */ var _PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _app_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4542);
/* harmony import */ var _app_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_app_globals_css__WEBPACK_IMPORTED_MODULE_2__);
/* __next_internal_client_entry_do_not_use__ default auto */ 



/* so app =====> posts on live server =====> rendered In Iframe here */ // front end inits node which runs proj + sends server data to front-end. 
// preview displays preview in template, gets specific route and renders
const PanelSection = (props)=>{
    const [stringInput, setStringInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [showStringInput, setShowStringInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [inputOne, setInputOne] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [inputTwo, setInputTwo] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const togglePrev = ()=>{
        setShowStringInput(!showStringInput);
        console.log(stringInput);
    };
    /* change handlers */ const handleChangeInput = (e)=>{
        setInputOne(e.currentTarget.value);
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: (_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default().container),
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("section", {
                className: (_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default().inputSection),
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("textarea", {
                        onChange: handleChangeInput,
                        className: (_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default().input)
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                        onClick: togglePrev,
                        className: (_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default().prevBtn),
                        children: "Preview Route"
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("section", {
                children: showStringInput && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("iframe", {
                    className: (_PanelSection_module_css__WEBPACK_IMPORTED_MODULE_3___default().iframe),
                    title: "Testing Iframe",
                    src: inputOne
                })
            })
        ]
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PanelSection);


/***/ }),

/***/ 4542:
/***/ (() => {



/***/ })

};
;