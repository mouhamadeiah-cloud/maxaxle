import { Customer, MerchantSettings, OperationDocument, OperationVehicleItem } from '../types';
import { calculateDocumentTaxes } from './taxCalculationEngine';

/**
 * Generates an authentic, structured XML electronic invoice according to EN 16931
 * (XRechnung 3.0 / UN/CEFACT CII - Cross Industry Invoice standard format for German B2G/B2B mandates).
 */
export function generateXRechnungXml(
  operation: Partial<OperationDocument> & {
    documentNumber: string;
    date: string;
    dueDate?: string;
    customer?: Customer;
    manualCustomer?: Partial<Customer>;
    vehicles: OperationVehicleItem[];
    paymentMethod?: string;
    notes?: string;
    eRechnungDetails?: {
      buyerReference: string;
      standardFormat: 'XRechnung' | 'ZUGFeRD';
      buyerVatId?: string;
    };
  },
  seller: MerchantSettings
): string {
  const calc = calculateDocumentTaxes(
    operation.documentType || 'e_rechnung',
    operation.vehicles || [],
    operation.depositAmount || 0,
    operation.notes
  );

  const customerName = operation.customer?.name || 
    (operation.manualCustomer?.companyName || `${operation.manualCustomer?.firstName || ''} ${operation.manualCustomer?.lastName || ''}`.trim()) || 
    'Kunde';
  const customerStreet = operation.customer?.street || operation.manualCustomer?.street || 'Musterstraße 1';
  const customerZip = operation.customer?.postalCode || operation.manualCustomer?.postalCode || '10115';
  const customerCity = operation.customer?.city || operation.manualCustomer?.city || 'Berlin';
  const customerCountry = operation.customer?.country || operation.manualCustomer?.country || 'DE';
  const customerVatId = operation.customer?.vatId || operation.manualCustomer?.vatId || operation.eRechnungDetails?.buyerVatId || 'DE000000000';
  const buyerRef = operation.eRechnungDetails?.buyerReference || '991-12345-67';

  // Format dates into YYYYMMDD
  const formatIsoDate = (dStr?: string) => {
    if (!dStr) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (dStr.includes('.')) {
      const p = dStr.split('.');
      return `${p[2]}${p[1].padStart(2, '0')}${p[0].padStart(2, '0')}`;
    }
    return dStr.replace(/-/g, '');
  };

  const issueDateFormatted = formatIsoDate(operation.date);
  const dueDateFormatted = formatIsoDate(operation.dueDate);

  const totalNetFormatted = calc.totalNet.toFixed(2);
  const totalTaxFormatted = calc.totalTax.toFixed(2);
  const totalGrossFormatted = calc.totalGross.toFixed(2);
  const payableFormatted = calc.remainingAmount.toFixed(2);

  // Line Items XML
  const lineItemsXml = calc.items.map((ci, index) => {
    const lineId = index + 1;
    const itemNetFormatted = ci.netAmount.toFixed(2);
    const itemGrossFormatted = ci.grossAmount.toFixed(2);
    const itemPriceFormatted = ci.sellingPrice.toFixed(2);
    const veh = ci.item;

    return `
    <!-- Line Item ${lineId}: ${veh.brand} ${veh.model} -->
    <rsm:IncludedSupplyChainTradeLineItem>
      <rsm:AssociatedDocumentLineDocument>
        <ram:LineID>${lineId}</ram:LineID>
      </rsm:AssociatedDocumentLineDocument>
      <rsm:SpecifiedTradeProduct>
        <ram:GlobalID schemeID="0160">${veh.vin || 'VIN-UNSPECIFIED'}</ram:GlobalID>
        <ram:Name>${veh.brand} ${veh.model} ${veh.variant || ''}</ram:Name>
        <ram:Description>FIN: ${veh.vin} | km-Stand: ${veh.mileage} km | EZ: ${veh.firstRegistration || 'N/A'} | Kraftstoff: ${veh.fuelType || 'Benzin'} | Leistung: ${veh.powerPs || 0} PS</ram:Description>
      </rsm:SpecifiedTradeProduct>
      <rsm:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${itemNetFormatted}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </rsm:SpecifiedLineTradeAgreement>
      <rsm:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">1.0</ram:BilledQuantity>
      </rsm:SpecifiedLineTradeDelivery>
      <rsm:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${ci.taxCode}</ram:CategoryCode>
          <ram:RateApplicablePercent>${ci.taxRatePercent}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${itemNetFormatted}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </rsm:SpecifiedLineTradeSettlement>
    </rsm:IncludedSupplyChainTradeLineItem>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice 
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" 
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" 
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" 
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  
  <!-- Exchanged Document Context -->
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  
  <!-- Exchanged Document Header -->
  <rsm:ExchangedDocument>
    <ram:ID>${operation.documentNumber}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${issueDateFormatted}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>${operation.notes || 'Rechnung für Fahrzeuglieferung gem. gesetzlichen Vorgaben.'}</ram:Content>
      <ram:SubjectCode>AAI</ram:SubjectCode>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  
  <!-- Supply Chain Trade Transaction -->
  <rsm:SupplyChainTradeTransaction>
    ${lineItemsXml}
    
    <!-- Trade Agreement (Seller & Buyer) -->
    <rsm:ApplicableHeaderTradeAgreement>
      <ram:BuyerReference>${buyerRef}</ram:BuyerReference>
      
      <!-- Seller (Verkäufer / Rechnungssteller) -->
      <ram:SellerTradeParty>
        <ram:Name>${seller.companyName}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:TradingBusinessName>${seller.companyName} ${seller.legalForm}</ram:TradingBusinessName>
        </ram:SpecifiedLegalOrganization>
        <ram:DefinedTradeContact>
          <ram:PersonName>${seller.responsiblePerson}</ram:PersonName>
          <ram:TelephoneUniversalCommunication>
            <ram:CompleteNumber>${seller.phone}</ram:CompleteNumber>
          </ram:TelephoneUniversalCommunication>
          <ram:EmailURIUniversalCommunication>
            <ram:URIID>${seller.email}</ram:URIID>
          </ram:EmailURIUniversalCommunication>
        </ram:DefinedTradeContact>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${seller.postalCode}</ram:PostcodeCode>
          <ram:LineOne>${seller.street}</ram:LineOne>
          <ram:CityName>${seller.city}</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${seller.vatId || 'DE319824550'}</ram:ID>
        </ram:SpecifiedTaxRegistration>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="FC">${seller.taxNumber || '27/451/09812'}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      
      <!-- Buyer (Käufer / Rechnungsempfänger) -->
      <ram:BuyerTradeParty>
        <ram:Name>${customerName}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${customerZip}</ram:PostcodeCode>
          <ram:LineOne>${customerStreet}</ram:LineOne>
          <ram:CityName>${customerCity}</ram:CityName>
          <ram:CountryID>${customerCountry}</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${customerVatId}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:BuyerTradeParty>
    </rsm:ApplicableHeaderTradeAgreement>
    
    <!-- Delivery -->
    <rsm:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${issueDateFormatted}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </rsm:ApplicableHeaderTradeDelivery>
    
    <!-- Settlement & Payment -->
    <rsm:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCodeCode>58</ram:TypeCodeCode>
        <ram:Information>SEPA Credit Transfer</ram:Information>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${seller.iban || 'DE89100400000123456789'}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${seller.bic || 'COBADEFFXXX'}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${totalTaxFormatted}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${totalNetFormatted}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>19.00</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      
      <ram:SpecifiedTradePaymentTerms>
        <ram:Description>Zahlbar rein netto bis zum ${operation.dueDate || 'sofort'}</ram:Description>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${dueDateFormatted}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${totalNetFormatted}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${totalNetFormatted}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${totalTaxFormatted}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${totalGrossFormatted}</ram:GrandTotalAmount>
        <ram:TotalPrepaidAmount>${(operation.depositAmount || 0).toFixed(2)}</ram:TotalPrepaidAmount>
        <ram:DuePayableAmount>${payableFormatted}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </rsm:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

export function downloadXRechnungFile(xmlContent: string, fileName: string = 'XRechnung.xml') {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
