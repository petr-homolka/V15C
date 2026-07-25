import * as React from 'react';
export interface SignUpProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Welcome to our CRM.\nSign Up to getting started.". */
  text1?: string;
  /** Text content; defaults to "Enter your details to proceed further". */
  text2?: string;
  /** Text content; defaults to "Or sign in with". */
  text3?: string;
}
export declare const SignUp: React.FC<SignUpProps>;
export default SignUp;
