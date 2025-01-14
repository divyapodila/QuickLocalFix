import React, { useState, useEffect } from 'react';
import "./DashboardProducts.css"
import productImage from './assets/no_products.png'; // Import your login image here
import { toast } from 'react-toastify';

function DashboardProducts({ customer, cartItems, setCartItems }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedProducts, setAddedProducts] = useState([]);
  const [sortOption, setSortOption] = useState(null);

  useEffect(() => {
    if (!customer) {
      const storedCustomer = JSON.parse(localStorage.getItem('customer'));
      if (storedCustomer && storedCustomer.id) {
        customer = storedCustomer;
      }
    }
  }, [customer]);

  useEffect(()=>{
    setCartItems(cartItems);
    const productIds = cartItems.map(item => item.id);
    setAddedProducts(productIds);
  },[cartItems]);

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const fetchCartDetails = async () => {
    try {
      if (!customer || !customer.id) {
        return;
      }
      const response = await fetch(`http://localhost:8000/get_cart/?customer_id=${customer.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart details');
      }
      const data = await response.json();
      if (data.cart_items) {
        setCartItems(data.cart_items);
        const productIds = data.cart_items.map(item => item.id);
        setAddedProducts(productIds);
      } else {
        setCartItems([]);
        setAddedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching cart details:', error);
    }
  };

  const sortProducts = (option) => {
    let sortedProducts = [...products];
    switch (option) {
      case 'lowToHigh':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'highToLow':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'aToZ':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'zToA':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    setProducts(sortedProducts);
    setSortOption(option);
  };

  const handleSearch = () => {
    setLoading(true);
    fetch(`http://localhost:8000/get_products/?query=${query}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setProducts(data);
        setLoading(false);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
        setError('Error fetching products. Please try again.');
      });
  };

  const addToCart = (productId) => {
    fetch('http://localhost:8000/add_to_cart/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `customer_id=${customer.id}&product_id=${productId}`
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }
        fetchCartDetails(); // Update cart items after adding to cart
        setAddedProducts([...addedProducts, productId]);
        toast.success('Item added to cart!', {});
      })
      .catch(error => {
        console.error('Error adding item to cart:', error);
      });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-search-sort-container">
        <div className="dashboard-search-form">
          <div className="dashboard-search-container">
            <input type="text" placeholder="Search..." value={query} onChange={(text_event) => setQuery(text_event.target.value)} />
            <button type="button" onClick={handleSearch}><i className="fa fa-search" aria-hidden="true"></i></button>
          </div>
        </div>
        <div className="dashboard-sort-dropdown">
          <label htmlFor="sort">Sort by: </label>
          <select id="sort" value={sortOption} onChange={(e) => sortProducts(e.target.value)}>
            <option value="">Select an option</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="aToZ">Name: A-Z</option>
            <option value="zToA">Name: Z-A</option>
          </select>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : products.length === 0 ? (
        <div className="dashboard-no-product">
          <div>
            <img src={productImage} alt="No products found" />
            <p>No products found. Try searching for something to get started!</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-product-container">
          {products.map(product => (
            <div key={product.id} className="dashboard-product-card">
              <div className="dashboard-product-image">
                <img src={product.image_url} alt={product.name} />
              </div>
              <div className="dashboard-product-details">
                <h3>{product.name}</h3>
                <p>Price: $ {product.price}</p>
                <button className={addedProducts.includes(product.id) ? 'added' : ''} onClick={() => addToCart(product.id)} disabled={addedProducts.includes(product.id)}>
                  {addedProducts.includes(product.id) ? 'Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardProducts;
