// Define a new module for our app
angular.module("app", [])
    .constant('translations', {
        en: {
            label: 'English',
            colors: 'Colors',
            dimension: 'Dimension',
            movement: 'Movement',
            horizontal: 'Horizontal',
            vertical: 'Vertical',
            oblique1: 'Oblique 1',
            oblique2: 'Oblique 2',
            speed: 'Speed',
            start: 'Start',
            stop: 'Stop'
        },
        de: {
            label: 'Deutsch',
            colors: 'Farben',
            dimension: 'Dimension',
            movement: 'Bewegung',
            horizontal: 'Horizontal',
            vertical: 'Vertikal',
            oblique1: 'Schräg 1',
            oblique2: 'Schräg 2',
            speed: 'Geschwindigkeit',
            start: 'Anfang',
            stop: 'Halt'
        },
        fr: {
            label: 'Français',
            colors: 'Couleurs',
            dimension: 'Dimension',
            movement: 'Mouvement',
            horizontal: 'Horizontal',
            vertical: 'Verticale',
            oblique1: 'Oblique 1',
            oblique2: 'Oblique 2',
            speed: 'Vélocité',
            start: 'Démarrer',
            stop: 'Arrêtez'
        },
        it: {
            label: 'Italiano',
            colors: 'Colori',
            dimension: 'Dimensione',
            movement: 'Movimento',
            horizontal: 'Orizzontale',
            vertical: 'Verticale',
            oblique1: 'Obliquo 1',
            oblique2: 'Obliquo 2',
            speed: 'Velocità',
            start: 'Partenza',
            stop: 'Stop'
        },
        es: {
            label: 'Español',
            colors: 'Colores',
            dimension: 'Dimensión',
            movement: 'Movimiento',
            horizontal: 'Horizontal',
            vertical: 'Vertical',
            oblique1: 'Oblicua 1',
            oblique2: 'Oblicua 2',
            speed: 'Velocidad',
            start: 'Inicia',
            stop: 'Para'
        }
    })
    // controller
    .controller('ctrl', ['$scope', '$rootScope', '$window', 'translations', function ($scope, $rootScope, $window, trans) {

        // Initialize paper
        paper.install($window);
        paper.setup('myCanvas');

        // Configuration
        $scope.debug = false;
        $scope.conf = {
            defaultColor: '#d43f3a', // Default circle color
            defaultBgColor: '#1f1f1f', // Default background color
            border: 0.02, // circle border
            radius: {
                value: 50, // circle radius
                step: 5,
                min: 10,
                max: 300
            },
            velocity: {
                value: 20, // velocity increment
                step: 2,
                min: 2,
                max: 100
            },
            frameDisplacement: 1000, // divider to calculate the displacement (for each frame) in relation to the size of the playground
            movementAxis: '1,0', // movement axis (X, Y)
            lang: 'en' // default language: English
        };

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
            v: 1 // verso di scorrimento
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
            if (get() == 0)
                return ($scope.playgrd[c].delta / 2) + $scope.playgrd[c].min;
            else if (get() == 1)
                return $scope.playgrd[c].min;
            else
                return $scope.playgrd[c].max;
        }
        $scope.getStartPoint = function () {
            var pX, pY;
            pX = $scope.getCoord(getX, 'x');
            pY = $scope.getCoord(getY, 'y');
            return new Point(pX, pY);
        }
        $scope.init = function () {
            $scope.movement.dirty = false;
            $scope.movement.running = false;
            if ($scope.circle)
                $scope.circle.remove();
            $scope.circle = undefined;
            $scope.redrawBg();
            $scope.redrawCircle({
                reset: true
            });
        };
        $scope.redrawCircle = function (arg) {
            $scope.updatePlayground();
            var pos;
            if ($scope.circle) {
                pos = $scope.circle.position;
                $scope.circle.remove();
            }
            if (!pos || (arg && arg.reset))
                pos = $scope.getStartPoint();
            if (pos.x < $scope.playgrd.x.min) pos.x += ($scope.playgrd.x.min - pos.x);
            else if (pos.x > $scope.playgrd.x.max) pos.x -= (pos.x - $scope.playgrd.x.max);
            if (pos.y < $scope.playgrd.y.min) pos.y += ($scope.playgrd.y.min - pos.y);
            else if (pos.y > $scope.playgrd.y.max) pos.y -= (pos.y - $scope.playgrd.y.max);
            $scope.circle = new Path.Circle(pos, $scope.conf.radius.value);
            if (!$scope.color) $scope.color = $scope.conf.defaultColor;
            document.getElementById('color').value = ($scope.color);
            document.getElementById('color').style.backgroundColor = $scope.color;
            $scope.circle.fillColor = $scope.color;
        };
        $scope.redrawBg = function () {
            if (bgRectangle)
                bgRectangle.remove();
            if (!$scope.bgcolor) $scope.bgcolor = $scope.conf.defaultBgColor;
            document.getElementById('bgcolor').value = ($scope.bgcolor);
            document.getElementById('bgcolor').style.backgroundColor = $scope.bgcolor;
            bgRectangle = new Path.Rectangle({
                point: [0, 0],
                size: [view.size.width, view.size.height],
                fillColor: $scope.bgcolor,
                selected: true
            });
            bgRectangle.sendToBack();
        }
        $scope.start = function () {
            $scope.movement.running = true;
            $scope.movement.dirty = true;
        }
        $scope.stop = function () {
            $scope.movement.running = false;
        }
        $scope.isRunning = function () {
            return $scope.movement.running;
        }
        $scope.isDirty = function () {
            return $scope.movement.dirty;
        }
        $scope.toggleRun = function () {
            if ($scope.isRunning()) $scope.stop();
            else $scope.start();
        }
        view.onFrame = function (event) {
            if (!$scope.movement.running) return;
            if ($scope.debug && event.count % 10 == 0) {
                $scope.event = event;
                $scope.$apply(); // aggiorno i dati esposti per il DEBUG
            }
            if (getX() !== 0) {
                if ($scope.movement.v == getX() && $scope.circle.position.x < $scope.playgrd.x.max)
                    $scope.circle.position.x += $scope.conf.velocity.value * $scope.playgrd.x.delta / $scope.conf.frameDisplacement;
                else if ($scope.movement.v == -getX() && $scope.circle.position.x > $scope.playgrd.x.min)
                    $scope.circle.position.x -= $scope.conf.velocity.value * $scope.playgrd.x.delta / $scope.conf.frameDisplacement;
                else $scope.movement.v = -$scope.movement.v;
            }
            if (getY() !== 0) {
                if ($scope.movement.v == getY() && $scope.circle.position.y < $scope.playgrd.y.max)
                    $scope.circle.position.y += $scope.conf.velocity.value * $scope.playgrd.y.delta / $scope.conf.frameDisplacement;
                else if ($scope.movement.v == -getY() && $scope.circle.position.y > $scope.playgrd.y.min)
                    $scope.circle.position.y -= $scope.conf.velocity.value * $scope.playgrd.y.delta / $scope.conf.frameDisplacement;
                else if (getX() === 0) // inverto il senso di marcia solo non è già stato fatto per x
                    $scope.movement.v = -$scope.movement.v;
            }
        }
        view.onKeyUp = function (e) {
            if ($scope.debug) console.log(e.key, e);
            if (['space', 'enter'].indexOf(e.key) >= 0) {
                $scope.toggleRun();
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
        }
        $scope.init();
        paper.view.draw();
        // Gestione della lingua
        $scope.lang = $scope.conf.lang;
        $scope.trans = trans;
    }])