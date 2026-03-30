import { Unit, Product, Promotion, Category } from './types';
import { 
  Apple, 
  Beef, 
  Milk, 
  Croissant, 
  Droplets, 
  Sparkles, 
  Beer, 
  ShoppingBag, 
  Package 
} from 'lucide-react';
import React from 'react';

export const convertToStandard = (quantity: number, unit: Unit): { value: number; standardUnit: string } => {
  switch (unit) {
    case 'kg':
      return { value: quantity * 1000, standardUnit: 'g' };
    case 'L':
      return { value: quantity * 1000, standardUnit: 'ml' };
    default:
      return { value: quantity, standardUnit: unit };
  }
};

export const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Hortifruti': return <Apple size={20} />;
    case 'Açougue': return <Beef size={20} />;
    case 'Laticínios': return <Milk size={20} />;
    case 'Padaria': return <Croissant size={20} />;
    case 'Limpeza': return <Droplets size={20} />;
    case 'Higiene': return <Sparkles size={20} />;
    case 'Bebidas': return <Beer size={20} />;
    case 'Mercearia': return <ShoppingBag size={20} />;
    default: return <Package size={20} />;
  }
};

export const calculateRealPrice = (product: Product, loyaltyDiscount: number = 0): { totalPaid: number; pricePerUnit: number; promoDescription: string } => {
  const { price, quantity, promotion } = product;
  let totalPaid = price;
  let effectiveQuantity = quantity;
  let promoDescription = '';

  switch (promotion.type) {
    case 'buyXPayY':
      if (promotion.buyQty && promotion.payQty) {
        totalPaid = (price / promotion.buyQty) * promotion.payQty;
        promoDescription = `Leve ${promotion.buyQty}, Pague ${promotion.payQty}`;
      }
      break;

    case 'secondUnitDiscount':
      if (promotion.discountPercentage) {
        totalPaid = (price + price * (1 - promotion.discountPercentage / 100)) / 2;
        promoDescription = `2ª unidade com ${promotion.discountPercentage}% OFF`;
      }
      break;

    case 'wholesale':
      if (promotion.minQty && promotion.wholesalePrice) {
        totalPaid = promotion.wholesalePrice;
        promoDescription = `Atacado (mín. ${promotion.minQty} un)`;
      }
      break;

    case 'paymentMethod':
      if (promotion.discountPercentage) {
        totalPaid = price * (1 - promotion.discountPercentage / 100);
        promoDescription = `Desconto ${promotion.discountPercentage}% (Pagamento)`;
      }
      break;

    case 'progressive':
      if (promotion.discountPercentage) {
        totalPaid = price * (1 - promotion.discountPercentage / 100);
        promoDescription = `Desconto Progressivo ${promotion.discountPercentage}%`;
      }
      break;

    default:
      totalPaid = price;
      promoDescription = 'Preço Regular';
  }

  // Apply loyalty discount if any
  if (loyaltyDiscount > 0) {
    totalPaid = totalPaid * (1 - loyaltyDiscount / 100);
    promoDescription += ` (+${loyaltyDiscount}% Fidelidade)`;
  }

  const standard = convertToStandard(effectiveQuantity, product.unit);
  const pricePerUnit = totalPaid / (standard.value || 1);

  return { totalPaid, pricePerUnit, promoDescription };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatUnitValue = (value: number, unit: Unit) => {
  const standard = convertToStandard(1, unit);
  const label = standard.standardUnit === 'un' ? 'unidade' : standard.standardUnit;
  
  if (value < 0.01 && (unit === 'g' || unit === 'ml' || unit === 'kg' || unit === 'L')) {
    return `${formatCurrency(value * 100)} / 100${standard.standardUnit}`;
  }
  
  return `${formatCurrency(value)} / ${label}`;
};
