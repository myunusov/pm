"use strict";

/**
 * Properties
 * Directive and Domains Objects
 */

var mxObjects = angular.module('mxObjects', []);

mxObjects.controller('PropCtrl', function ($scope, messageService, presentationModel) {
    $scope.changeValue = function (fieldName) {
        var model = presentationModel.currentModel();
        model.init();
        var changedField = new Parameter(fieldName, $scope.owner);
        if (!model.calculate(changedField)) {
            messageService.error("Performance Model is not consistent");
        }
        if (!model.valid()) {
            messageService.error("Performance Model is invalid");
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
    this.isCoflicted = function () {
        return false;
    };
    this.isCalculated = function () {
        return false;
    };

    this.getPattern = function() {
        return ".*";
    };

    this._getPattern = function() {
        return this.getPattern();
    };

    Object.defineProperty(this, 'pattern', {
        get: this._getPattern
    });

    this.getStatus = function () {
        if (!this.isValid()) {
            return "invalid";
        }
        if (this.isCoflicted()) {
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
    };

    /**
     * Property toset (get) property by user.
     */
    Object.defineProperty(this, 'text', {
        get: this._getText,
        set: this._setText
    });

}

function MXName(value) {
    this.init(value);
    this.valid = function () {
        return !empty(this.text);
    };
}
MXName.prototype = new MXProperty();

function MXNumber(value) {
    this.calculated = false;
    this.coflicted = false;
    this.value = value || undefined;
    this._text = value || undefined;

    /**
     * Post construct;
     * @param value initial value
     */
    this.init = function (value) {
        this.value = value;
        this._text = value;
    };
    this.setDTO = function (dto) {
        this._text = dto;
        this.value = dto;
        this.calculated = false;
    };

    this.createDTO = function () {
        return this.calculated ? null : this.value;
    };

    this.getPattern = function() {
        return "\\d*[\\., \\,]?\\d*";
    };

    this.getText = function () {
        return number(this._text) ?
            this._text : (
            number(this.value) ?
                this.formatNumber(this.value, 5) :
                this.value
        );
    };

    this.setText = function (value) {
        this.calculated = false;
        this._text = value;
        this.value = number(value) ? this.formatNumber(value, 10) : undefined;
    };

    /**
     * Set value on calculate
     * @param newValue new Value
     */
    this.setValue = function (newValue) {
        if (number(this._text) && equals(this._text, newValue)) {
            return;
        }
        this.value = parseFloat(newValue).toPrecision(10);
        this.calculated = true;
        this.coflicted = number(this._text) && !equals(this._text, newValue);
        this._text = null;
    };

    this.isValid = function () {
        return !this.value || (number(this.value) && this.value >= 0);
    };
    this.isCoflicted = function () {
        return this.coflicted;
    };
    this.isCalculated = function () {
        return this.calculated;
    };

    this.asString = function () {
        return this.text;
    };

    this.formatNumber = function(value, prec) {
        return Math.round(value) === value ? Math.round(value) : parseFloat(parseFloat(value).toPrecision(prec).toString());
    };

    function equals (value1, value2) {
        return parseFloat(value1).toPrecision(10) === parseFloat(value2).toPrecision(10);
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

    this.setDTO = function (dto) {
        this._text = null;
        this.value = dto.value;
        this.unit = this.unitById(dto.unit);
        this.calculated = false;
    };

    this.createDTO = function () {
        return {
            value: this.calculated ? null : this.value,
            unit:  this.unit ? this.unit.id : null
        }
    };

    this.getPattern = function() {
        return this.unit.pattern;
    };

    this.getText = function () {
        return number(this._text) ?
            this._text : (
            number(this.value) ?
                this.formatNumber(this.value / this.unit.rate, 5) :
                this.value
        );
    };

    this.setText = function (value) {
        this.calculated = false;
        this._text = value;
        this.value = number(value) ? this.formatNumber(value * this.unit.rate, 10) : undefined;
    };

    this.setValue = function (newValue) {
        // TODO compare with different unit
        if (number(this._text) && equals(this._text, newValue)) {
            return;
        }
        this.value = parseFloat(newValue).toPrecision(10);
        this.calculated = true;
        this.coflicted = number(this._text) && !equals(this._text, newValue);
        this._text = null;
    };

    this.setUnit = function (newValue) {
        this.unit = newValue;
        this._text = null;
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
        return this.text + " " + this.unit.title;
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
}
MXDuration.prototype = new MXQuantity();
