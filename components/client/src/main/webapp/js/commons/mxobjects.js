"use strict";

/**
 * Properties
 * Directive and Domains Objects
 */

var mxObjects = angular.module('mxObjects', []);

mxObjects.controller('PropCtrl', function ($scope, messageService, presentationModel) {
    $scope.calculate = function () {
        var model = presentationModel.currentModel();
        try {
            model.calculate();
        } catch (e) {
            messageService.error(e);
        }
    };
});

mxObjects.directive('property', function () {
    return {
        restrict: 'E',
        scope: {
            prop: "=value",
            type: "=",
            owner: "="
        },
        controller: 'PropCtrl',
        replace: true,
        templateUrl: "views/mx-property.html"
    };
});

function MXProperty() {

    this.owner = null;

    /**
     * Post construct;
     * @param value initial value
     */
    this.init = function (value) {
        this.value = value;
    };
    this.createDTO = function () {
        return this.value;
    };
    this.setDTO = function (dto) {
        this.value = dto;
    };

    this.isValid = function () {
        return true;
    };
    this.isConflicted = function () {
        return false;
    };
    this.isCalculated = function () {
        return false;
    };

    this.getPattern = function () {
        return ".*";
    };

    this._getPattern = function () {
        return this.getPattern();
    };

    Object.defineProperty(this, 'pattern', {
        get: this._getPattern
    });

    this.getStatus = function () {
        if (!this.isValid()) {
            return "invalid";
        }
        if (this.isConflicted()) {
            return "conflict";
        }
        if (this.isCalculated()) {
            return "eval";
        }
        return "";
    };

    Object.defineProperty(this, 'state', {
        get: this.getStatus
    });

    this.getText = function () {
        return this.value;
    };

    this.setText = function (value) {
        this.value = value;
    };

    this._getText = function () {
        return this.getText();
    };

    this._setText = function (value) {
        this.setText(value);
        if (this.owner) {
            this.owner.onchange(this);
        }
    };

    /**
     * Property toset (get) property by user.
     */
    Object.defineProperty(this, 'text', {
        get: this._getText,
        set: this._setText
    });


    this.cleanValue = function () {
    };
}

function MXName(value) {
    this.init(value);
    this.valid = function () {
        return !empty(this.text);
    };
}
MXName.prototype = new MXProperty();

function MXNumber(value) {

    this._text = value || undefined;
    this.value = value || undefined;

    /**
     * Post construct;
     * @param value initial value
     */
    this.init = function (value) {
        this.value = value;
        this._text = value;
    };

    this.createDTO = function () {
        return this._text;
    };

    this.setDTO = function (dto) {
        this._text = dto;
        this.value = this.textToValue(dto);
    };

    this.getPattern = function () {
        return "\\d*[\\., \\,]?\\d*";
    };

    this.getText = function () {
        if (!this.isCalculated  && !this.isConflicted()) {
            return this._text;
        }
        return this.valueToText(this.value);
    };

    this.setText = function (text) {
        this._text = text;
        this.value =  this.textToValue(text);
    };

    this.textToValue = function(text) {
        return number(text) ? this.formatNumber(text, 10) : undefined;
    };

    this.valueToText = function(value) {
        return number(value) ? this.formatNumber(this.value, 5) : value;
    };

    /**
     * Set value on calculate
     * @param newValue new Value
     */
    this.setValue = function (newValue) {
        if (this.isConflicted()) {
            this._text = null;
        }
        this.value = parseFloat(newValue).toPrecision(10);
    };

    this.isValid = function () {
        return !this.value || (number(this.value) && this.value >= 0);
    };
    this.isConflicted = function () {
        return number(this._text) && !equals(this.textToValue(this._text), this.value);
    };
    this.isCalculated = function () {
        return !this._text;
    };

    this.cleanValue = function () {
        if (this.isCalculated()) {
            this.value = undefined;
        }
    };

    this.asString = function () {
        return this.text;
    };

    this.formatNumber = function (value, prec) {
        return Math.round(value) === value ? Math.round(value) : parseFloat(parseFloat(value).toPrecision(prec).toString());
    };

    function equals(value1, value2) {
        return parseFloat(value1).toPrecision(5) === parseFloat(value2).toPrecision(5);
    }


}
MXNumber.prototype = new MXProperty();

function MXUnit(id, title, rate, add, pattern) {
    this.id = id;
    this.title = (title || title === '') ? title : id;
    this.rate = rate || 1;
    this.add = add || 0;

    this.pattern = pattern || "\\d*[\\., \\,]?\\d*";

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof MXUnit) &&
            other.id === this.id;
    };
}


function MXQuantity() {

    this.unit = undefined;

    /**
     * Post construct;
     * @param value initial value
     * @param unitId id of quantity Unit
     */
    this.init = function (unitId, value) {
        this.value = value;
        this._text = value;
        this.unit = this.unitById(unitId) || this.units[0];
    };

    this.createDTO = function () {
        return {
            text: this._text,
            unit: this.unit ? this.unit.id : null
        }
    };

    this.setDTO = function (dto) {
        this.unit = this.unitById(dto.unit);
        this._text = dto.text;
        this.value = this.textToValue(dto.text);
    };

    this.speedUpBy = function (base) {
        return number(base.value) && number(this.value) ? this.formatNumber(this.value / base.value, 3) : "?";
    };

    this.boost = function (base) {
        if (!(number(base.value) && number(this.value))) {
            return "?"
        }
        var speedUp = this.value / base.value;
        return this.formatNumber(speedUp < 1 ? -(1 - speedUp) * 100 : (1 - 1 / speedUp) * 100, 3);

    };

    this.getPattern = function () {
        return this.unit.pattern;
    };

    this.setUnit = function (newValue) {
        this.unit = newValue;
        if (!this.isCalculated()) {
            this._text = this.valueToText(newValue);
        }
    };

    this.textToValue = function(text) {
        return number(text) ? this.formatNumber(text * this.unit.rate, 10) : undefined;
    };

    this.valueToText = function(value) {
        return number(value) ? this.formatNumber(value / this.unit.rate, 5) : value;
    };

    this.empty = function () {
        return empty(this.value);
    };

    this.availableUnits = function () {
        var result = [];
        if (!this.units) {
            return result;
        }
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].equals(this.unit)) {
                result.push(this.units[i]);
            }
        }
        return result;
    };

    this.unitById = function (unitId) {
        if (!unitId) {
            return null;
        }
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].id === unitId) {
                return this.units[i];
            }
        }

    };

    this.asString = function () {
        return (this.text || "?") + " " + this.unit.title;
    };

}
MXQuantity.prototype = new MXNumber();

function MXPercentage(unitId, value) {
    this.units = [
        new MXUnit('rate'), // XXX pattern
        new MXUnit('percent', '%', 0.01) // XXX pattern
    ];
    this.init(unitId, value);
    this.isValid = function () {
        return !this.value || (number(this.value) && this.value < 1 && this.value >= 0);
    };
}
MXPercentage.prototype = new MXQuantity();

function MXDuration(unitId, value) {
    this.units = [
        new MXUnit('ms', 'ms', 0.001),
        new MXUnit('sec'),
        new MXUnit('min', 'min', 60),
        new MXUnit('hr', 'hr', 3600)
    ];
    this.init(unitId, value);
    this.speedUpBy = function (base) {
        return number(base.value) && number(this.value) ? this.formatNumber(base.value / this.value, 3) : "?";
    };
}
MXDuration.prototype = new MXQuantity();

function MXThroughput(unitId, value) {
    this.units = [
        new MXUnit('tps'),
        new MXUnit('tpm', 'tpm', 1 / 60),
        new MXUnit('tph', 'tph', 1 / 3600)
    ];
    this.init(unitId, value);
}
MXThroughput.prototype = new MXQuantity();