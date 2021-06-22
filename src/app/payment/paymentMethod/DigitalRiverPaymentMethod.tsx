import React, { useCallback, useContext, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import { PaymentFormValues } from '../PaymentForm';

import HostedDropInPaymentMethod from './HostedDropInPaymentMethod';
import { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type DigitalRiverPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues>;

export enum DigitalRiverClasses {
    base =  'form-input optimizedCheckout-form-input',
}

const DigitalRiverPaymentMethod: FunctionComponent<DigitalRiverPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    formik: { submitForm },
    ...rest
}) => {
    function getLocale() {
        const supportedLocales = rest.method.initializationData?.regionalDefaultLocales.supported;

        if (supportedLocales.indexOf(navigator.language) >= 0) {
            return navigator.language;
        }

        const languagePrefix = navigator.language.split('-')[0];
        const languageDefaults = rest.method.initializationData?.regionalDefaultLocales.defaults;

        if (languageDefaults[languagePrefix] !== undefined) {
            return languageDefaults[languagePrefix];
        }

        return 'en-US';
    }
    const { setSubmitted } = useContext(FormContext);
    const containerId = `${rest.method.id}-component-field`;
    const disabledPaymentMethods = rest.method.initializationData?.disabledPaymentMethods ?? [];
    const locale = getLocale();

    const initializeDigitalRiverPayment = useCallback(options => initializePayment({
        ...options,
        digitalriver: {
            containerId,
            locale,
            configuration: {
                flow: 'checkout',
                showSavePaymentAgreement: false,
                showComplianceSection: true,
                button: {
                    type: 'submitOrder',
                },
                usage: 'unscheduled',
                showTermsOfSaleDisclosure: true,
                paymentMethodConfiguration: {
                    disabledPaymentMethods,
                    classes: DigitalRiverClasses,
                },
            },
            onSubmitForm: () => {
                setSubmitted(true);
                submitForm();
            },
            onError: (error: Error) => {
                onUnhandledError?.(error);
            },
        },
    }), [initializePayment, containerId, disabledPaymentMethods, locale, setSubmitted, submitForm, onUnhandledError]);

    return <HostedDropInPaymentMethod
        { ...rest }
        containerId={ containerId }
        hideVerificationFields
        initializePayment={ initializeDigitalRiverPayment }
    />;
};

export default connectFormik(DigitalRiverPaymentMethod);
