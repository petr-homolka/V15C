import * as React from 'react';
export interface DetailsProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Welcome to our CRM.\nSign Up to getting started.". */
  text1?: string;
  /** Text content; defaults to "Enter your details to proceed further". */
  text2?: string;
}
export declare const Details: React.FC<DetailsProps>;
export default Details;
