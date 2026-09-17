import { render, screen } from '@testing-library/react';
import Breadcrumb from './Breadcrumb';

test('renders breadcrumb labels without placeholder links', () => {
  render(<Breadcrumb items={['Home', 'Products', 'Details']} />);

  expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent('Home');
  expect(screen.getByText('Products')).toBeInTheDocument();
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
