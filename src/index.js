$(function () {
    'use strict';

    var pageConfig = {
        OPT_OUT: 'optOut',
        OPT_OUT_EVENT: new Event('outOut'),
        CANCEL_OPT_OUT: 'cancelOptOut',
        CANCEL_OPT_OUT_EVENT: new Event(this.CANCEL_OPT_OUT),
        CLEAR_OPT_OUT: 'clearOptOut',
        OPT_OUT_LISTENERS: '[data-opt-out-listener]',
        CANCEL_OPT_OUT_LISTENERS: '[data-cancel-opt-out-listener]',
    };

    hiddenPlanCodeInit({
        PLAN_CODE: { 
            DATA_NAME: 'plan-code'
        },
        PLAN_CODE_HIDDEN: {
            SELECTOR: '[name=plan-code-hidden]',
        },
        DATA_PLAN_CODE_ACTIVE: {
            SELECTOR: '[data-plan-code-active]',
            ATTR: 'data-plan-code-active'
        },
        OPT_OUT: pageConfig.OPT_OUT,
        OPT_OUT_LISTENER: '[data-opt-out-listener=plan-code-hidden]',
        PLAN_CODE_NONE: 'none',
    });

    hiddenPlanTypeInit({
        PLAN_TYPE: {
            DATA_NAME: 'plan-type'
        },
        PLAN_TYPE_HIDDEN: {
            SELECTOR: '[name=plan-type-hidden]',
        },
        DATA_PLAN_TYPE_ACTIVE: {
            SELECTOR: '[data-plan-type-active]',
            ATTR: 'data-plan-type-active'
        },
        OPT_OUT: pageConfig.OPT_OUT,
        OPT_OUT_LISTENER: '[data-opt-out-listener=plan-type-hidden]',
        PLAN_TYPE_NONE: 'none'
    });

    dependentsInit({
        DEPENDENT_CHECKBOXES: {
            SELECTOR: '.subscriber'
        },
        PLAN_CODE_HIDDEN: {
            SELECTOR: '[name=plan-code-hidden]',
        },
        PLAN_CODE: {
            FAMILY: 'family',
            INDIVIDUAL: 'individual'
        },
        OPT_OUT: pageConfig.OPT_OUT,
        OPT_OUT_LISTENER: '[data-opt-out-listener=subscriber]',
        CANCEL_OPT_OUT: pageConfig.CANCEL_OPT_OUT,
        CANCEL_OPT_OUT_LISTENER: '[data-cancel-opt-out-listener=subscriber]',
        PLAN_CODE_INDIVIDUAL: 'individual'
    });

    planTypesInit({
        PLAN_TYPE: {
            SELECTOR: '[name=plan-type]'
        },
        PLAN_TYPE_HIDDEN: {
            SELECTOR: '[name=plan-type-hidden]',
        },
        OPT_OUT: pageConfig.OPT_OUT,
        OPT_OUT_LISTENER: '[data-opt-out-listener=plan-type]',
        CLEAR_OPT_OUT: pageConfig.CLEAR_OPT_OUT
    });

    optOutInit({
        OPT_OUT_CHECKBOX: {
            SELECTOR: '#opt-out'
        },
    });

    function optOutInit(props) {
        validateProps(props);
        function validateProps(props) { }

        $(props.OPT_OUT_CHECKBOX.SELECTOR).click(function (event) {
            event.stopPropagation();
            var checked = event.target.checked;
            if (checked) {
                raiseEvent('optOut');   // hard coded value
            } else {
                raiseEvent('cancelOptOut'); // hard coded value
            }
        });
    }


    // TODO: page load logic needed


    function raiseEvent(eventName) {
        var events = {
            clearOptOut: function () {
                var $optOut = $('#opt-out');    // hard coded value
                var checked = $optOut.prop('checked');  // hard coded value
                if (checked) {
                    $optOut.trigger('click');   // hard coded value
                }
            },
            optOut: function () {
                $(pageConfig.OPT_OUT_LISTENERS).trigger(pageConfig.OPT_OUT);
            },
            cancelOptOut: function () {
                $(pageConfig.CANCEL_OPT_OUT_LISTENERS).trigger(pageConfig.CANCEL_OPT_OUT);
            }
        }

        events[eventName]();
    }

    function planTypesInit(props) {
        validateProps(props);
        function validateProps(props) { }

        $(props.PLAN_TYPE.SELECTOR).click(function (event) {
            event.stopPropagation();
            var planType = event.target.value;
            onPlanTypeClicked(planType, props);
        });

        $(props.OPT_OUT_LISTENER).on(props.OPT_OUT, function (event) {
            clearPlanTypes(props);
        });

        function clearPlanTypes(config) {
            var $target = $(props.PLAN_TYPE.SELECTOR);
            $target.prop('checked', false);
        }

        function onPlanTypeClicked(planType, config) {
            raiseEvent('clearOptOut');  // hard coded value
            triggerRadio(config.PLAN_TYPE_HIDDEN.SELECTOR, planType);
        }
    }

    function dependentsInit(props) {
        validateProps(props);
        function validateProps(props) { }

        $(props.DEPENDENT_CHECKBOXES.SELECTOR).click(function (event) {
            event.stopPropagation();
            onDependentCheckboxClicked(props);
        });

        $(props.OPT_OUT_LISTENER).on(props.OPT_OUT, function (event) {
            clearDependents(props);
        });

        $(props.CANCEL_OPT_OUT_LISTENER).on(props.CANCEL_OPT_OUT, function (event) {
            onDependentCheckboxClicked(props);
        });

        function onDependentCheckboxClicked(config) {
            var $target = $(config.DEPENDENT_CHECKBOXES.SELECTOR);
            var anyChecked = anyDependentsChecked(config);

            raiseEvent('clearOptOut');  // hard coded value

            if (anyChecked) {
                activatePlanCode(config.PLAN_CODE.FAMILY, config);
            } else {
                activatePlanCode(config.PLAN_CODE.INDIVIDUAL, config);
            }
        }

        function anyDependentsChecked(config) {
            var $target = $(config.DEPENDENT_CHECKBOXES.SELECTOR);
            var anyChecked = $target.filter(':checked').length > 0;
            return anyChecked;
        }

        function clearDependents(config) {
            var $target = $(config.DEPENDENT_CHECKBOXES.SELECTOR);
            $target.prop('checked', false);
        }

        function activatePlanCode(planCode, config) {
            triggerRadio(config.PLAN_CODE_HIDDEN.SELECTOR, planCode);
            // should trigger event instead
        }
    }

    function hiddenPlanTypeInit(props) {
        validateProps(props);
        function validateProps(props) { }

        $(props.PLAN_TYPE_HIDDEN.SELECTOR).click(function (event) {
            event.stopPropagation();
            var planType = event.target.value;
            onPlanTypeClicked(planType, props);
        });

        $(props.OPT_OUT_LISTENER).on(props.OPT_OUT, function (event) {
            // Trigger click to check the none radio option
            triggerRadio(props.PLAN_TYPE_HIDDEN.SELECTOR, props.PLAN_TYPE_NONE);
        });

        function onPlanTypeClicked(planType, config) {
            resetPlanTypes(config);
            activatePlanType(planType, config);
        }

        function resetPlanTypes(config) {
            var $target = $(config.DATA_PLAN_TYPE_ACTIVE.SELECTOR);
            $target.attr(config.DATA_PLAN_TYPE_ACTIVE.ATTR, false);
        }

        function activatePlanType(planType, config) {
            var $target = $(config.DATA_PLAN_TYPE_ACTIVE.SELECTOR);
            $target.each(function () {
                var currentPlanType = $(this).data(config.PLAN_TYPE.DATA_NAME);
                currentPlanType = currentPlanType.toString();
                if (currentPlanType === planType) {
                    $(this).attr(config.DATA_PLAN_TYPE_ACTIVE.ATTR, true);
                }
            });
        }
    }

    function hiddenPlanCodeInit(props) {

        validateProps(props);   // throws if props is invalid

        $(props.PLAN_CODE_HIDDEN.SELECTOR).click(function (event) {
            event.stopPropagation();
            var planCode = event.target.value;
            onPlanCodeClicked(planCode, props);
        });

        $(props.OPT_OUT_LISTENER).on(props.OPT_OUT, function (event) {
            // Trigger click to check the none radio option
            triggerRadio(props.PLAN_CODE_HIDDEN.SELECTOR, props.PLAN_CODE_NONE);
        });
        
        function onPlanCodeClicked(planCode, config) {
            resetPlanCodes(config);
            activatePlanCode(planCode, config);
        }

        function resetPlanCodes(config) {
            var $target = $(config.DATA_PLAN_CODE_ACTIVE.SELECTOR);
            $target.attr(config.DATA_PLAN_CODE_ACTIVE.ATTR, false);
        }

        function activatePlanCode(planCode, config) {
            var $target = $(config.DATA_PLAN_CODE_ACTIVE.SELECTOR);
            $target.each(function () {
                var currentPlanCode = $(this).data(config.PLAN_CODE.DATA_NAME);
                if (currentPlanCode === planCode) {
                    $(this).attr(config.DATA_PLAN_CODE_ACTIVE.ATTR, true);
                }
            });
        }

        function validateProps(props) {

            if (typeof props !== 'object') {
                throw new Error('planCodeInit: props is invalid object');
            }

            if (typeof props.PLAN_CODE !== 'object') {
                throw new Error('planCodeInit: props.PLAN_CODE is invalid object');
            }

            if (typeof props.PLAN_CODE.DATA_NAME !== 'string') {
                throw new Error('planCodeInit: props.PLAN_CODE.DATA_NAME is invalid string');
            }

            if (typeof props.PLAN_CODE_HIDDEN !== 'object') {
                throw new Error('planCodeInit: props.PLAN_CODE_HIDDEN is invalid object');
            }

            if (typeof props.PLAN_CODE_HIDDEN.SELECTOR !== 'string') {
                throw new Error('planCodeInit: props.PLAN_CODE_HIDDEN.SELECTOR is invalid string');
            }

            if (typeof props.DATA_PLAN_CODE_ACTIVE !== 'object') {
                throw new Error('planCodeInit: props.DATA_PLAN_CODE_ACTIVE is invalid object');
            }

            if (typeof props.DATA_PLAN_CODE_ACTIVE.SELECTOR !== 'string') {
                throw new Error('planCodeInit: props.DATA_PLAN_CODE_ACTIVE.SELECTOR is invalid string');
            }

            if (typeof props.DATA_PLAN_CODE_ACTIVE.ATTR !== 'string') {
                throw new Error('planCodeInit: props.DATA_PLAN_CODE_ACTIVE.ATTR is invalid string');
            }
        }
    }

    function triggerRadio(selector, targetValue) {
        //alert("don't do this");
        var $target = $(selector);
        $target.each(function () {
            var value = $(this).val();
            if (value === targetValue) {
                $(this).trigger('click');
                return false;   // breaks out of 'each' loop
            }
        });
    }
});
