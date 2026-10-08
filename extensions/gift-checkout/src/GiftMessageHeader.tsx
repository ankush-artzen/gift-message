import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {GiftMessage} from './Checkout.jsx';

export default async () => {
  render(<GiftMessage />, document.body);
};
