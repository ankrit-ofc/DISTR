import React from 'react';
import { Html, Head, Body, Container, Section, Row, Column, Heading, Text, Button, Hr } from '@react-email/components';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface EBillEmailProps {
  orderNumber: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  grandTotal: number;
  deliveryDistrict: string;
  paymentMethod: string;
  companyName: string;
  companyPan: string;
  invoiceDate: string;
}

export function EBillEmail({
  orderNumber,
  storeName,
  items,
  subtotal,
  vatAmount,
  deliveryFee,
  grandTotal,
  deliveryDistrict,
  paymentMethod,
  companyName,
  companyPan,
  invoiceDate,
}: EBillEmailProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>DISTRO</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>E-Bill — {orderNumber}</Heading>
            <Text style={subtext}>Hi {storeName}, here is your electronic bill.</Text>

            {/* Invoice meta */}
            <Row style={{ marginBottom: '16px' }}>
              <Column style={{ width: '50%' }}>
                <Text style={metaLine}><strong>From:</strong> {companyName}</Text>
                {companyPan && <Text style={metaLine}>PAN: {companyPan}</Text>}
              </Column>
              <Column style={{ width: '50%' }}>
                <Text style={metaLine}><strong>Invoice:</strong> {orderNumber}</Text>
                <Text style={metaLine}><strong>Date:</strong> {invoiceDate}</Text>
              </Column>
            </Row>

            {/* Items table */}
            <Row style={tableHeader}>
              <Column style={{ ...th, width: '40%' }}>Item</Column>
              <Column style={{ ...th, width: '10%' }}>Qty</Column>
              <Column style={{ ...th, width: '20%' }}>Unit Price</Column>
              <Column style={{ ...th, width: '15%' }}>VAT 13%</Column>
              <Column style={{ ...th, width: '15%' }}>Total</Column>
            </Row>

            {items.map((item, i) => {
              const itemVat = item.total * 0.13;
              return (
                <Row key={i} style={i % 2 === 0 ? rowEven : rowOdd}>
                  <Column style={{ ...td, width: '40%' }}>{item.name}</Column>
                  <Column style={{ ...td, width: '10%' }}>{item.qty}</Column>
                  <Column style={{ ...td, width: '20%' }}>Rs {item.price.toFixed(2)}</Column>
                  <Column style={{ ...td, width: '15%' }}>Rs {itemVat.toFixed(2)}</Column>
                  <Column style={{ ...td, width: '15%' }}>Rs {(item.total + itemVat).toFixed(2)}</Column>
                </Row>
              );
            })}

            {/* Totals */}
            <Hr style={hr} />
            <Row style={totalRow}>
              <Column style={{ width: '60%' }}></Column>
              <Column style={{ ...td, width: '40%' }}>Subtotal: Rs {subtotal.toFixed(2)}</Column>
            </Row>
            <Row style={totalRow}>
              <Column style={{ width: '60%' }}></Column>
              <Column style={{ ...td, width: '40%' }}>VAT (13%): Rs {vatAmount.toFixed(2)}</Column>
            </Row>
            {deliveryFee > 0 && (
              <Row style={totalRow}>
                <Column style={{ width: '60%' }}></Column>
                <Column style={{ ...td, width: '40%' }}>Delivery: Rs {deliveryFee.toFixed(2)}</Column>
              </Row>
            )}
            <Row style={{ ...totalRow, backgroundColor: '#1A4BDB' }}>
              <Column style={{ width: '60%' }}></Column>
              <Column style={{ ...td, width: '40%', color: '#ffffff', fontWeight: 'bold' }}>
                Grand Total: Rs {grandTotal.toFixed(2)}
              </Column>
            </Row>

            <Hr style={hr} />
            <Text style={metaLine}>Delivery: <strong>{deliveryDistrict}</strong></Text>
            <Text style={metaLine}>Payment: <strong>{paymentMethod}</strong></Text>

            <Button style={btn} href={`https://distronepal.com/orders`}>
              View Order
            </Button>

            <Text style={note}>
              This is a computer-generated e-bill as per IRD Nepal. For the full VAT invoice PDF, visit your order details.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>{companyName} — distronepal.com</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body:        React.CSSProperties = { backgroundColor: '#F7F9FF', fontFamily: 'system-ui, sans-serif' };
const container:   React.CSSProperties = { maxWidth: '600px', margin: '0 auto', padding: '24px 0' };
const header:      React.CSSProperties = { backgroundColor: '#1A4BDB', padding: '20px 32px', borderRadius: '8px 8px 0 0' };
const logo:        React.CSSProperties = { color: '#ffffff', fontWeight: 'bold', fontSize: '24px', margin: 0 };
const content:     React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px' };
const h1:          React.CSSProperties = { color: '#0D1120', fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px' };
const subtext:     React.CSSProperties = { color: '#555555', fontSize: '14px', margin: '0 0 24px' };
const tableHeader: React.CSSProperties = { backgroundColor: '#1A4BDB', borderRadius: '4px 4px 0 0' };
const th:          React.CSSProperties = { color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '8px 4px' };
const td:          React.CSSProperties = { color: '#0D1120', fontSize: '12px', padding: '8px 4px' };
const rowEven:     React.CSSProperties = { backgroundColor: '#F7F9FF' };
const rowOdd:      React.CSSProperties = { backgroundColor: '#ffffff' };
const totalRow:    React.CSSProperties = { borderTop: '1px solid #e5e7eb' };
const hr:          React.CSSProperties = { borderColor: '#e5e7eb', margin: '20px 0' };
const metaLine:    React.CSSProperties = { color: '#0D1120', fontSize: '14px', margin: '0 0 6px' };
const btn:         React.CSSProperties = { backgroundColor: '#00C46F', color: '#ffffff', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block', marginTop: '16px' };
const note:        React.CSSProperties = { color: '#9ca3af', fontSize: '13px', marginTop: '20px' };
const footer:      React.CSSProperties = { color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: 0 };
