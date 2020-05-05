$(function () {
    'use strict';

    var controller,
        pageConfig;

    // All selectors and other 'constants' are centralized to this single
    // configuration object to be shared in this scope.
    pageConfig = {
        DATA_PLAN_CODE_ACTIVE_ATTR: 'data-plan-code-active',
        DATA_PLAN_CODE_ACTIVE_SELECTOR: '[data-plan-code-active]',
        DATA_PLAN_TYPE_ACTIVE_ATTR: 'data-plan-type-active',
        DATA_PLAN_TYPE_ACTIVE_SELECTOR: '[data-plan-type-active]',
        DEPENDENT_CHECKBOXES_SELECTOR: '.subscriber',
        EXPANDED_DEPENDENT_CHECKBOXES_SELECTOR: '.subscriber-expanded',
        EXPANDED_PLAN_TYPE_SELECTOR: '.plan-type-expanded',
        OPT_OUT_CHECKBOX_SELECTOR: '#opt-out',
        PLAN_CODE_DATA_NAME: 'plan-code',
        PLAN_CODE_DEFAULT: 'individual',
        PLAN_CODE_FAMILY: 'family',
        PLAN_CODE_INDIVIDUAL: 'individual',
        PLAN_TYPE_DATA_NAME: 'plan-type',
        PLAN_TYPE_SELECTOR: '[name=plan-type]',
    };

    controller = controllerInit({
        onCancelOptOut: onCancelOptOut,
        onOptOut: onOptOut,
        onSetPlanCode: onSetPlanCode,
        onSetPlanType: onSetPlanType,
    });

    dependentCheckboxesInit(controller, pageConfig);
    planTypeRadiosInit(controller, pageConfig);
    optOutCheckboxInit(controller, pageConfig);

    // Setup initial state of the page
    onPageLoad(pageConfig);


    // =========================================================================
    // Input initialization logic
    // =========================================================================


    /*
     * Initialization logic for the dependent checkboxes.
     */
    function dependentCheckboxesInit(controller, config) {

        expandHitBox(config);

        /*
         * The dependent checkboxes will trigger the following events:
         *   - SET_PLAN_CODE
         *   - CANCEL_OPT_OUT
         */
        function onClick(config) {
            var event;

            event = controller.event.SET_PLAN_CODE;
            controller.raise(event);

            event = controller.event.CANCEL_OPT_OUT;
            controller.raise(event);
        }

        /*
         * Enable the entire dependend record row to be clickable.
         */
        function expandHitBox(config) {
            // Prevent direct clicking on the checkbox
            $(pageConfig.DEPENDENT_CHECKBOXES_SELECTOR).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                //onClick(config);
            });

            // The parent element will handle the click event and check the box
            $(config.EXPANDED_DEPENDENT_CHECKBOXES_SELECTOR).click(function (event) {
                var $childTarget,
                    checked;

                event.preventDefault();
                event.stopPropagation();

                $childTarget = $(event.target).parent().find('input');
                checked = $childTarget.prop('checked');
                $childTarget.prop('checked', !checked);

                onClick(config);
            });
        }
    }

    /*
     * Initialization logic for the plan type radio inputs.
     */
    function planTypeRadiosInit(controller, config) {

        expandHitBox(config);

        /*
         * The plan type radio inputs will trigger the following events:
         *   - SET_PLAN_TYPE
         *   - CANCEL_OPT_OUT
         *   - SET_PLAN_CODE 
         */
        function onClick(planType, config) {
            var event,
                eventProps;

            event = controller.event.SET_PLAN_TYPE;
            eventProps = { planType: planType };
            controller.raise(event, eventProps);

            event = controller.event.CANCEL_OPT_OUT;
            controller.raise(event);

            // Raising the SET_PLAN_CODE event ensures that the chart will show
            // the appropriate plan code as unshaded. This is necessary if this
            // is the first click event after opt-out is checked.
            event = controller.event.SET_PLAN_CODE;
            controller.raise(event);
        }

        /*
         * Enable the entire containing cell to be clickable.
         */
        function expandHitBox(config) {
            // Prevent direct clicking on the radio button
            $(config.PLAN_TYPE_SELECTOR).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                //var planType = event.target.value;
                //onClick(planType, config);
            });

            // The parent element will handle the click event and check the
            // radio input
            $(config.EXPANDED_PLAN_TYPE_SELECTOR).click(function (event) {
                var $childTarget,
                    planType;

                event.preventDefault();
                event.stopPropagation();

                $childTarget = $(event.target).parent().find('input');
                $childTarget.prop('checked', true);
                planType = $childTarget.val();

                onClick(planType, config);
            });
        }
    }

    /*
     * Initialization logic for the opt-out checkbox.
     */
    function optOutCheckboxInit(controller, config) {
        $(config.OPT_OUT_CHECKBOX_SELECTOR).click(function (event) {
            var checked = event.target.checked;
            onClick(checked, config);
        });

        /*
         * The opt-out checkbox triggers the following events:
         *   - If checked:
         *     - OPT_OUT
         *   - If unchecked:
         *     - CANCEL_OPT_OUT
         *     - SET_PLAN_CODE
         */
        function onClick(checked, config) {
            var event;

            event = checked ?
                controller.event.OPT_OUT :
                controller.event.CANCEL_OPT_OUT;
            controller.raise(event);

            if (checked === false) {
                // If we are unchecking the opt-out box, reset the chart to show
                // the default plan code (individual)
                event = controller.event.SET_PLAN_CODE;
                controller.raise(event, { planCode: config.PLAN_CODE_DEFAULT });
            }
        }
    }


    // =========================================================================
    // Event handlers
    // =========================================================================
    

    /* 
     * The onSetPlanCode function will handle shading the columns of the chart
     * for 'Family' or 'Individual'.  There may be scenarios where both columns
     * should be shaded (such as during opt-out). 
     *
     * If no props parameters are passed to this function, the PLAN_CODE_DEFAULT
     * option (individual) will be implemented.  
     */
    function onSetPlanCode(props) {
        var config,
            anyChecked,
            planCode;

        config = pageConfig;

        if (props === undefined) {
            anyChecked = anyDependentsChecked(config);
            planCode = anyChecked ? 
                config.PLAN_CODE_FAMILY :
                config.PLAN_CODE_DEFAULT;    
        } else {
            planCode = props.planCode;
        }

        shadeAllPlanCodes(config);
        removeShading(planCode, config);

        /*
         * Make all columns shaded (default style).
         */
        function shadeAllPlanCodes(config) {
            var $target = $(config.DATA_PLAN_CODE_ACTIVE_SELECTOR);
            $target.attr(config.DATA_PLAN_CODE_ACTIVE_ATTR, false);
        }

        /* 
         * Remove shading from a specific plan code column. The unshaded column
         * is considered the current 'active' plan code option.
         */
        function removeShading(planCode, config) {
            var $target = $(config.DATA_PLAN_CODE_ACTIVE_SELECTOR);
            $target.each(function () {
                var data = $(this).data(config.PLAN_CODE_DATA_NAME);
                if (data === planCode) {
                    $(this).attr(config.DATA_PLAN_CODE_ACTIVE_ATTR, true);
                }
            });
        }

        /*
         * Useful helper function to determine if 'Family' column or
         * 'Individual' should be shaded.
         * If dependents are checked, the 'Individual' column would become
         * shaded, and vice-versa.
         */
        function anyDependentsChecked(config) {
            var $targets,
                result;

            $targets = $(config.DEPENDENT_CHECKBOXES_SELECTOR);
            result = $targets.filter(':checked').length > 0;

            return result;
        }
    }


    /*
     * The onSetPlanType function will handle the logic for plan type
     * highlighting on the chart.
     */
    function onSetPlanType(props) {
        var config,
            planType;

        config = pageConfig;
        planType = props.planType;

        removePlanTypeHighlighting(config);
        addPlanTypeHighlighting(planType, config);

        /*
         * Remove the plan type highlighting from the chart.
         */
        function removePlanTypeHighlighting(config) {
            var $targets;

            $targets = $(config.DATA_PLAN_TYPE_ACTIVE_SELECTOR);
            $targets.attr(config.DATA_PLAN_TYPE_ACTIVE_ATTR, false);
        }

        /*
         * Implement the appropriate highlighting on the chart for a given plan
         * type.
         */
        function addPlanTypeHighlighting(planType, config) {
            var $targets;

            $targets = $(config.DATA_PLAN_TYPE_ACTIVE_SELECTOR);

            $targets.each(function () {
                var data;

                data = $(this).data(config.PLAN_TYPE_DATA_NAME);
                data = data.toString();

                if (data === planType) {
                    $(this).attr(config.DATA_PLAN_TYPE_ACTIVE_ATTR, true);
                }
            });
        }
    }

    /*
     * The onOptOut function will handle the logic for an opt-out event.
     */
    function onOptOut(props) {
        var config,
            $targets;

        config = pageConfig;

        // Uncheck all plan type radio inputs and remove plan type highlighting
        // in the chart.
        $targets = $(config.PLAN_TYPE_SELECTOR);
        $targets.prop('checked', false);
        $targets = $(config.DATA_PLAN_TYPE_ACTIVE_SELECTOR);
        $targets.attr(config.DATA_PLAN_TYPE_ACTIVE_ATTR, false);

        // Uncheck all dependent boxes and apply shading to both the 'Family'
        // and 'Individual' columns in the chart.
        $targets = $(config.DEPENDENT_CHECKBOXES_SELECTOR);
        $targets.prop('checked', false);
        $targets = $(config.DATA_PLAN_CODE_ACTIVE_SELECTOR);
        $targets.attr(config.DATA_PLAN_CODE_ACTIVE_ATTR, false);
    }

    /*
     * The onCancelOptOut function will handle the logic for canceling an
     * opt-out.  Other inputs may trigger this logic to remove the check from
     * the opt-out checkbox.
     */
    function onCancelOptOut(props) {
        var config,
            $optOut;

        // NOTE: do not add additional logic to this function. Many inputs
        // trigger this event handler, so additional logic here could cause
        // unexpected side effects to the page state.

        config = pageConfig;
        $optOut = $(config.OPT_OUT_CHECKBOX_SELECTOR);

        // Uncheck box if it isn't already unchecked. Some click event may
        // trigger the opt-out box to be unchecked.
        $optOut.prop('checked', false);     
    }

    /*
     * The onPageLoad function will handle setting up the state of the chart
     * with appropriate shading/highlighting of plan code/type info.
     * NOTE: not currently an available event handler in the controller.
     */
    function onPageLoad(config) {
        var event,
            optOut,
            planType,
            planCode;

        optOut = isOptOut(config);
        planType = getPlanType(config);
        planCode = getPlanCode(config);

        //console.log('optOut: ' + optOut);
        //console.log('planType: ' + planType);
        //console.log('planCode: ' + planCode);

        if (optOut) {
            // Opt-out is checked, all dependents are unchecked, chart is fully
            // shaded for both 'Family' and 'Individual' columns.
            event = controller.event.OPT_OUT;
            controller.raise(event);
        } else {
            // Opt-out is unchecked, resolve the appropriate state for the plan
            // type and plan codes.
            event = controller.event.SET_PLAN_CODE 
            controller.raise(event, { planCode: planCode });

            // Plan type should default to 'individual' if no dependents are
            // enrolled.
            event = controller.event.SET_PLAN_TYPE
            controller.raise(event, { planType: planType });
        }


        // Get opt-out checkbox status
        function isOptOut(config) {
            var result,
                $target;

            $target = $(config.OPT_OUT_CHECKBOX_SELECTOR);
            result = $target.prop('checked');

            return result;
        }

        // Resolve the current plan code (based on checked dependents)
        function getPlanCode(config) {
            var result,
                anyChecked,
                $targets;

            $targets = $(config.DEPENDENT_CHECKBOXES_SELECTOR);
            anyChecked = $targets.filter(':checked').length > 0;

            result = anyChecked ? 
                config.PLAN_CODE_FAMILY :
                config.PLAN_CODE_DEFAULT;

            return result;
        }

        // Get currently selected plan type
        function getPlanType(config) {
            var result,
                $targets;

            $targets = $(config.PLAN_TYPE_SELECTOR);
            result = $targets.filter(':checked').val();

            return result;
        }
    }


    // =========================================================================
    // Controller initialization logic
    // =========================================================================


    /*
     * This is the central hub for dispatching all page events. Returns an
     * object with the following properties:
     *   1) raise(eventName, props) {function} - raise an event, trigger event handler
     *   2) event {object} - contains all the available events to raise
     */
    function controllerInit(props) {
        var eventNames,
            onCancelOptOut;
            onOptOut,
            onSetPlanCode,
            onSetPlanType,

        onCancelOptOut = props.onCancelOptOut;
        onOptOut = props.onOptOut;
        onSetPlanCode = props.onSetPlanCode;
        onSetPlanType = props.onSetPlanType;

        // These are all the events that can be called for this page.
        eventNames = {
            CANCEL_OPT_OUT: 'CANCEL_OPT_OUT',
            OPT_OUT: 'OPT_OUT',
            SET_PLAN_CODE: 'SET_PLAN_CODE',
            SET_PLAN_TYPE: 'SET_PLAN_TYPE',
        };

        // This function is called to 'raise' a specific event by name.
        function raiseEvent(eventName, props) {
            var events;

            events = {
                CANCEL_OPT_OUT: onCancelOptOut,
                OPT_OUT: onOptOut,
                SET_PLAN_CODE: onSetPlanCode,
                SET_PLAN_TYPE: onSetPlanType,
            };

            events[eventName](props);
        }

        return {
            raise: raiseEvent,
            event: eventNames,
        }
    }
});
