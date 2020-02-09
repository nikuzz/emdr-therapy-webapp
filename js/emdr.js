const translations = appTranslations(); // from translations.js

// Define a new module for our app
angular.module("app", [])
        .constant('translations', translations)
        // controller
        .controller('ctrl', ['$scope', '$rootScope', '$window', 'translations', function ($scope, $rootScope, $window, trans) {

                // Initialize paper
                paper.install($window);
                paper.setup('myCanvas');

                // Configuration
                $scope.debug = false;
                $scope.conf = {
                    defaultColor: '#6ad9ff', // Default circle color
                    defaultBgColor: '#ffffff', // Default background color
                    border: 0.01, // circle border
                    radius: {
                        value: 50, // circle radius
                        step: 1,
                        min: 10,
                        max: 300
                    },
                    velocity: {
                        value: 50, // velocity increment
                        step: 1,
                        min: 1,
                        max: 200
                    },
                    duration: {
                        value: 30, // total set duration
                        step: 1,
                        min: 1,
                        max: 300
                    },
                    sound: false,
                    frameDisplacement: 5000, // divider to calculate the displacement (for each frame) in relation to the size of the playground
                    movementAxis: '1,0', // movement axis (X, Y)
                    lang: 'es', // default language: Español
                    menu: true
                };

                let cookie = getCookie('emdrJsonCookie');

                if (cookie) {
                    $scope.conf = JSON.parse(cookie);
                } else {
                    saveConfToCookie();
                }

                function saveConfToCookie() {
                    setCookie('emdrJsonCookie', JSON.stringify($scope.conf), 180); // 180 days
                }

                function getX() {
                    return Number($scope.conf.movementAxis.split(',')[0]);
                }

                function getY() {
                    return Number($scope.conf.movementAxis.split(',')[1]);
                }
                let circle;
                let bgRectangle;
                let reverse = {
                    x: 'y',
                    y: 'x'
                };

                $scope.movement = {
                    dirty: false,
                    running: false,
                    a: reverse[$scope.conf.dir], // asse di scorrimento
                    v: 1, // verso di scorrimento
                    time: 0, // time di inizio
                    timeRun: 0 // tempo esecuzione
                };

                $scope.updatePlayground = function () {
                    $scope.playgrd = {
                        y: {
                            min: Math.round($scope.conf.radius.value + ($scope.conf.border * view.bounds.height)),
                            max: Math.round(view.bounds.height - ($scope.conf.radius.value + ($scope.conf.border * view.bounds.height))),
                            delta: Math.round(view.bounds.height - 2 * ($scope.conf.radius.value + ($scope.conf.border * view.bounds.height)))
                        },
                        x: {
                            min: Math.round($scope.conf.radius.value + ($scope.conf.border * view.bounds.width)),
                            max: Math.round(view.bounds.width - ($scope.conf.radius.value + ($scope.conf.border * view.bounds.width))),
                            delta: Math.round(view.bounds.width - 2 * ($scope.conf.radius.value + ($scope.conf.border * view.bounds.width)))
                        }
                    };
                }

                $scope.getCoord = function (get, c) {
                    if (get() == 0) {
                        return ($scope.playgrd[c].delta / 2) + $scope.playgrd[c].min;
                    } else if (get() == 1) {
                        return $scope.playgrd[c].min;
                    } else {
                        return $scope.playgrd[c].max;
                    }
                }

                $scope.getStartPoint = function () {
                    var pX, pY;
                    pX = $scope.getCoord(getX, 'x');
                    pY = $scope.getCoord(getY, 'y');
                    return new Point(pX, pY);
                }

                $scope.init = function () {
                    saveConfToCookie();

                    $scope.movement.dirty = false;
                    $scope.movement.time = 0;
                    $scope.movement.running = false;
                    if ($scope.circle) {
                        $scope.circle.remove();
                    }
                    $scope.circle = undefined;
                    $scope.redrawBg();
                    $scope.redrawCircle({
                        reset: true
                    });
                };

                $scope.redrawCircle = function (arg) {
                    saveConfToCookie();

                    $scope.updatePlayground();
                    var pos;
                    if ($scope.circle) {
                        pos = $scope.circle.position;
                        $scope.circle.remove();
                    }

                    if (!pos || (arg && arg.reset)) {
                        pos = $scope.getStartPoint();
                    }

                    if (pos.x < $scope.playgrd.x.min) {
                        pos.x += ($scope.playgrd.x.min - pos.x);
                    } else if (pos.x > $scope.playgrd.x.max) {
                        pos.x -= (pos.x - $scope.playgrd.x.max);
                    }

                    if (pos.y < $scope.playgrd.y.min) {
                        pos.y += ($scope.playgrd.y.min - pos.y);
                    } else if (pos.y > $scope.playgrd.y.max) {
                        pos.y -= (pos.y - $scope.playgrd.y.max);
                    }

                    $scope.circle = new Path.Circle(pos, $scope.conf.radius.value);

                    if (!$scope.color) {
                        $scope.color = $scope.conf.defaultColor;
                    }

                    document.getElementById('color').value = ($scope.color);
                    document.getElementById('color').style.backgroundColor = $scope.color;
                    $scope.circle.fillColor = $scope.color;
                };

                $scope.redrawBg = function () {
                    saveConfToCookie();

                    if (bgRectangle) {
                        bgRectangle.remove();
                    }

                    if (!$scope.bgcolor) {
                        $scope.bgcolor = $scope.conf.defaultBgColor;
                    }

                    document.getElementById('bgcolor').value = ($scope.bgcolor);
                    document.getElementById('bgcolor').style.backgroundColor = $scope.bgcolor;
                    document.body.style.backgroundColor = $scope.bgcolor;


                    bgRectangle = new Path.Rectangle({
                        point: [0, 0],
                        size: [view.size.width, view.size.height],
                        fillColor: $scope.bgcolor
                    });

                    bgRectangle.sendToBack();
                };


                $scope.start = function () {
                    $scope.movement.running = true;
                    $scope.movement.dirty = true;
                    $scope.movement.time = Date.now();
                };

                $scope.stop = function () {
                    $scope.movement.running = false;
                };

                $scope.isRunning = function () {
                    return $scope.movement.running;
                };

                $scope.isDirty = function () {
                    return $scope.movement.dirty;
                };

                $scope.toggleRun = function () {
                    if ($scope.isRunning()) {
                        $scope.stop();
                    } else {
                        $scope.start();
                    }
                };

                $scope.toggleSound = function () {
                    if ($scope.conf.sound)
                        $scope.conf.sound = false;
                    else
                        $scope.conf.sound = true;
                };

                $scope.toggleMenu = function () {
                    if ($scope.isMenuVisible()) {
                        $scope.hideMenu();
                    } else {
                        $scope.showMenu();
                    }
                };

                $scope.hideMenu = function () {
                    $scope.conf.menu = false;
                };

                $scope.showMenu = function () {
                    $scope.conf.menu = true;
                };

                $scope.isMenuVisible = function () {
                    return $scope.conf.menu;
                };

                view.onFrame = function (event) {
                    if (!$scope.movement.running) {
                        return;
                    }

                    $scope.movement.timeRun = Date.now() - $scope.movement.time;

                    if ($scope.debug && event.count % 10 == 0) {
                        $scope.event = event;
                        $scope.$apply(); // aggiorno i dati esposti per il DEBUG
                    }

                    if (getX() !== 0) {
                        if ($scope.movement.v == getX() && $scope.circle.position.x < $scope.playgrd.x.max) {
                            $scope.circle.position.x += $scope.conf.velocity.value * $scope.playgrd.x.delta / $scope.conf.frameDisplacement;
                        } else if ($scope.movement.v == -getX() && $scope.circle.position.x > $scope.playgrd.x.min) {
                            $scope.circle.position.x -= $scope.conf.velocity.value * $scope.playgrd.x.delta / $scope.conf.frameDisplacement;
                        } else {
                            if ($scope.conf.sound) {
                                if ($scope.movement.v == '1') {
                                    playSound('right');
                                } else {
                                    playSound('left');
                                }
                            }
                            if ($scope.movement.v == -getX() && (Date.now() - $scope.movement.time) > ($scope.conf.duration.value * 1000)) {
                                $scope.init();
                                $scope.$apply();
                                return;
                            }
                            $scope.movement.v = -$scope.movement.v;
                        }
                    }
                    if (getY() !== 0) {
                        if ($scope.movement.v == getY() && $scope.circle.position.y < $scope.playgrd.y.max) {
                            $scope.circle.position.y += $scope.conf.velocity.value * $scope.playgrd.y.delta / $scope.conf.frameDisplacement;
                        } else if ($scope.movement.v == -getY() && $scope.circle.position.y > $scope.playgrd.y.min) {
                            $scope.circle.position.y -= $scope.conf.velocity.value * $scope.playgrd.y.delta / $scope.conf.frameDisplacement;
                        } else if (getX() === 0) {
                            if (($scope.movement.v == -getY()) && (Date.now() - $scope.movement.time) > ($scope.conf.duration.value * 1000)) {
                                $scope.init();
                                $scope.$apply();
                                return;
                            }
                            $scope.movement.v = -$scope.movement.v;
                        }
                    }
                };

                view.onResize = function (event) {
                    // Whenever the window is resized
                    $scope.redrawBg();
                    $scope.init();
                    $scope.$apply();
                }

                $scope.saveConf = function () {
                    var jsonse = JSON.stringify($scope.conf);
                    var blob = new Blob([jsonse], {
                        type: "application/json"
                    });
                    $scope.filename = $scope.filename || "EMDR";
                    saveAs(blob, $scope.filename + ".emdr");
                }

                $scope.fullScreen = function () {
                    if (
                            document.fullscreenElement ||
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement ||
                            document.msFullscreenElement
                            ) {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        }
                    } else {

                        let elem = document.documentElement;
                        let methodToBeInvoked = elem.requestFullscreen ||
                                elem.webkitRequestFullScreen || elem['mozRequestFullscreen']
                                ||
                                elem['msRequestFullscreen'];
                        if (methodToBeInvoked)
                            methodToBeInvoked.call(elem);
                    }
                }

                view.onKeyDown = function (e) {
                    if ($scope.debug) {
                        console.log(e.key, e);
                    }

                    if (['space', 'enter'].indexOf(e.key) >= 0) {
                        $scope.toggleRun();
                        $scope.$apply();
                    } else if (['r', 'R'].indexOf(e.key) >= 0) {
                        $scope.init();
                        $scope.$apply();
                    } else if (['h', 'H'].indexOf(e.key) >= 0) {
                        $scope.conf.movementAxis = '1,0';
                        $scope.$apply();
                    } else if (['v', 'V'].indexOf(e.key) >= 0) {
                        $scope.conf.movementAxis = '0,1';
                        $scope.$apply();
                    } else if (['1'].indexOf(e.key) >= 0) {
                        $scope.conf.movementAxis = '1,1';
                        $scope.$apply();
                    } else if (['2'].indexOf(e.key) >= 0) {
                        $scope.conf.movementAxis = '1,-1';
                        $scope.$apply();
                    } else if (['s', 'S'].indexOf(e.key) >= 0) {
                        $scope.toggleSound();
                        $scope.$apply();
                    } else if (['f', 'F'].indexOf(e.key) >= 0) {
                        $scope.fullScreen();
                        $scope.$apply();
                    } else if (['m', 'M'].indexOf(e.key) >= 0) {
                        $scope.toggleMenu();
                        $scope.$apply();
                    } else if (['dirty'].indexOf(e.key) >= 0 && $scope.conf.velocity.value < $scope.conf.velocity.max) {
                        $scope.debug = !$scope.debug;
                        $scope.$apply();
                    } else if (['+'].indexOf(e.key) >= 0 && $scope.conf.velocity.value < $scope.conf.velocity.max) {
                        $scope.conf.velocity.value += $scope.conf.velocity.step;
                        $scope.$apply();
                    } else if (['-'].indexOf(e.key) >= 0 && $scope.conf.velocity.value > $scope.conf.velocity.min) {
                        $scope.conf.velocity.value -= $scope.conf.velocity.step;
                        $scope.$apply();
                    }
                };

                $scope.init();
                paper.view.draw();

                // Language management
                $scope.lang = $scope.conf.lang;
                $scope.trans = trans;
            }]);