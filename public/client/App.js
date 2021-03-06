"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./Components/interfaces.d.ts" />
var react_1 = __importStar(require("react"));
var Header_1 = __importDefault(require("./Components/Header"));
var ChatList_1 = __importDefault(require("./Components/ChatList"));
var ChatRoom_1 = __importDefault(require("./Components/ChatRoom"));
var Signup_1 = __importDefault(require("./Components/Signup"));
var Login_1 = __importDefault(require("./Components/Login"));
var ChatCreation_1 = __importDefault(require("./Components/ChatCreation"));
// utils file will be imported once the document has been defined
var util;
var votesEventSource;
var Routes;
(function (Routes) {
    Routes[Routes["MAIN"] = 0] = "MAIN";
    Routes[Routes["CHAT_ROOM"] = 1] = "CHAT_ROOM";
    Routes[Routes["SIGN_UP"] = 2] = "SIGN_UP";
    Routes[Routes["LOG_IN"] = 3] = "LOG_IN";
    Routes[Routes["CHAT_CREATION"] = 4] = "CHAT_CREATION";
})(Routes = exports.Routes || (exports.Routes = {}));
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        _this.loadMain = function () {
            util.fetchAllChats()
                .then(function (chats) {
                _this.setState({
                    display: Routes.MAIN,
                    chatRooms: chats
                }, function () {
                    // push a new state to the history object
                    history.pushState(_this.state, 'Chatter', '/');
                });
            });
        };
        _this.loadChat = function (chatId) {
            util.fetchChatAndMessagesById(chatId)
                .then(function (result) {
                _this.setState({
                    display: Routes.CHAT_ROOM,
                    currentChat: result.currentChat,
                    messages: result.messages
                }, function () {
                    if (_this.state.currentChat) {
                        var chatName = _this.state.currentChat.chatName.replace(' ', '_');
                        history.pushState(_this.state, result.currentChat.chatName, "/c/" + chatName);
                    }
                });
            });
        };
        _this.loadLogin = function () {
            _this.setState({
                display: Routes.LOG_IN,
            }, function () {
                history.pushState(_this.state, 'Login', "/login");
            });
        };
        _this.loadSignup = function () {
            _this.setState({
                display: Routes.SIGN_UP,
            }, function () {
                history.pushState(_this.state, 'Signup', "/create_account");
            });
        };
        _this.loadChatCreation = function () {
            _this.setState({
                display: Routes.CHAT_CREATION
            }, function () {
                history.pushState(_this.state, 'Create a chat', "/create_chat");
            });
        };
        _this.login = function (credentials) {
            return util.login(credentials)
                .then(function (result) {
                if (result.success) {
                    _this.setState({ user: result.user }, function () { return _this.loadMain(); });
                }
                return result;
            });
        };
        _this.logout = function () {
            util.logout()
                .then(function (result) {
                if (result) {
                    _this.setState({ user: undefined }, function () {
                        _this.loadMain();
                        history.replaceState(_this.state, '');
                    });
                }
                else {
                    console.log('tried to logout with-out user token');
                }
            });
        };
        _this.authenticate = function () {
            util.authenticate()
                .then(function (user) {
                if (!user) {
                    _this.setState({ user: undefined }, function () {
                        history.replaceState(_this.state, '');
                    });
                }
                else {
                    _this.setState({ user: user }, function () {
                        history.replaceState(_this.state, '');
                        if (_this.state.user) {
                            votesEventSource = new EventSource("/api/stream/users/" + _this.state.user.username);
                            votesEventSource.addEventListener('new-vote', _this.handleUserGainedVotes);
                        }
                    });
                }
            });
        };
        _this.handleUserGainedVotes = function (e) {
            var currentUser = _this.state.user;
            if (currentUser) {
                currentUser.cp = currentUser.cp + 1;
                currentUser.votes = currentUser.votes + 1;
                _this.setState({
                    user: currentUser
                });
            }
        };
        _this.state = props;
        return _this;
    }
    App.prototype.componentDidMount = function () {
        var _this = this;
        window.onfocus = function () {
            _this.forceUpdate();
        };
        // Load utils and apply nProgress progress bar
        util = require('./util');
        // try to re-login user using the session token
        this.authenticate();
        // determain initial status and push it to the history state
        switch (this.state.display) {
            case Routes.MAIN:
                history.replaceState(this.state, 'Chatter', "/");
                break;
            case Routes.CHAT_ROOM:
                if (this.state.currentChat) {
                    var chatName = this.state.currentChat.chatName.replace(' ', '_');
                    history.replaceState(this.state, this.state.currentChat.chatName, "/c/" + chatName);
                }
                break;
            case Routes.SIGN_UP:
                history.replaceState(this.state, 'Signup', '/create_account');
                break;
            case Routes.LOG_IN:
                history.replaceState(this.state, 'Login', '/login');
                break;
            case Routes.CHAT_CREATION:
                history.replaceState(this.state, 'Create a chat', '/create_chat');
                break;
            default:
                console.log("[-] Something went wrong, the initial data is: " + this.props.__INITIAL_DATA__);
                break;
        }
        // removes the unneeded initial data variable from the global object
        delete window.__INITIAL_DATA__;
        // handle popstate event
        window.addEventListener('popstate', function (e) {
            _this.setState(e.state);
        });
    };
    App.prototype.contentSwitch = function () {
        switch (this.state.display) {
            case Routes.MAIN: // route: '/'
                return (react_1.default.createElement(ChatList_1.default, { onChatClick: this.loadChat, chatList: this.state.chatRooms }));
            case Routes.CHAT_ROOM: // route: '/chat/[chatName]'
                return (react_1.default.createElement(ChatRoom_1.default, { chat: this.state.currentChat, user: this.state.user, messages: this.state.messages, goToLogin: this.loadLogin, goToSignup: this.loadSignup }));
            case Routes.SIGN_UP: // route: '/create_account'
                return (react_1.default.createElement(Signup_1.default, { login: this.login, goToLogin: this.loadLogin, goToChatter: this.loadMain, user: this.state.user }));
            case Routes.LOG_IN: // route: '/login'
                return (react_1.default.createElement(Login_1.default, { login: this.login, goToSignup: this.loadSignup, goToChatter: this.loadMain, user: this.state.user }));
            case Routes.CHAT_CREATION: // route: '/create_chat'
                return (react_1.default.createElement(ChatCreation_1.default, { goToChatter: this.loadMain, user: this.state.user }));
            default:
                return "Something went wrong, the initial data is: " + JSON.stringify(this.props.__INITIAL_DATA__);
        }
    };
    App.prototype.render = function () {
        return (react_1.default.createElement("div", { id: "flexer", className: "ui grid" },
            react_1.default.createElement(Header_1.default, { goToChatter: this.loadMain, goToChatCreation: this.loadChatCreation, goToLogin: this.loadLogin, goToSignup: this.loadSignup, user: this.state.user, logout: this.logout, display: this.state.display }),
            this.contentSwitch()));
    };
    return App;
}(react_1.Component));
exports.default = App;
