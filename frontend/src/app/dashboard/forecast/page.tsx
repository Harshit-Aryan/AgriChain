'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Info, BarChart3 } from 'lucide-react';
import { api, ForecastData, Product } from '@/lib/api';

const LOCATIONS = ['Mumbai', 'Pune', 'Nashik', 'Delhi', 'Nagpur', 'Indore'];

export default function DemandForecastPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('Tomato');
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products.list()
      .then((p) => {
        setProducts(p);
      })
      .catch(console.error);
  }, []);

  const loadForecast = (product: string, location: string) => {
    setFetching(true);
    setError('');
    api.forecast.get(product, location)
      .then(setForecast)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
        setForecast(null);
      })
      .finally(() => {
        setFetching(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadForecast(selectedProduct, selectedLocation);
  }, [selectedProduct, selectedLocation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">AI Demand Forecasting</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              ESTIMATE ONLY
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Predictive agricultural demand and regional supply-gap projection model
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="card p-5 bg-white flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Crop / Commodity
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input text-sm"
          >
            {products.length > 0
              ? products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.category})
                  </option>
                ))
              : ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize', 'Soybean'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Target Consumption Region
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="input text-sm"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-sm text-amber-900">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Demand Projection Notice</p>
          <p className="text-xs text-amber-800 mt-0.5">
            All forecasted demand metrics, percentage shifts, and shortage indicators are algorithmic ESTIMATES derived from historical order volumes, seasonal monsoon factors, and market patterns. They do not represent guaranteed commercial demand.
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="card p-12 text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto text-gray-400 animate-pulse mb-2" />
          <p className="text-sm">Calculating seasonal demand projection for {selectedProduct} in {selectedLocation}...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600">
          <p className="font-semibold">Unable to load forecast data</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      ) : forecast ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <span className="text-xs text-gray-500 block">Current Weekly Demand</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {forecast.currentWeeklyDemand.toLocaleString('en-IN')} kg
              </p>
              <span className="text-[11px] text-gray-400">Baseline consumption</span>
            </div>

            <div className="card p-5">
              <span className="text-xs text-gray-500 block">Predicted Demand (Next 30D)</span>
              <p className="text-2xl font-bold text-primary-700 mt-1">
                {forecast.predictedDemand.toLocaleString('en-IN')} kg
              </p>
              <span className="text-[11px] text-primary-600 font-medium">Model projection</span>
            </div>

            <div className="card p-5">
              <span className="text-xs text-gray-500 block">Expected Trend</span>
              <div className="flex items-center gap-1.5 mt-1">
                {forecast.expectedChangePercent >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-2xl font-bold ${
                  forecast.expectedChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {forecast.expectedChangePercent >= 0 ? `+${forecast.expectedChangePercent}%` : `${forecast.expectedChangePercent}%`}
                </p>
              </div>
              <span className="text-[11px] text-gray-400">Seasonal variance</span>
            </div>

            <div className={`card p-5 ${forecast.potentialShortage > 0 ? 'bg-amber-50/50 border-amber-200' : ''}`}>
              <span className="text-xs text-gray-500 block">Potential Supply Gap</span>
              <div className="flex items-center gap-1.5 mt-1">
                {forecast.potentialShortage > 0 && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                <p className="text-2xl font-bold text-amber-700">
                  {forecast.potentialShortage > 0
                    ? `${(forecast.potentialShortage / 1000).toFixed(1)}T`
                    : 'Balanced'}
                </p>
              </div>
              <span className="text-[11px] text-amber-700">
                {forecast.potentialShortage > 0 ? 'Estimated regional shortfall' : 'Adequate supply buffer'}
              </span>
            </div>
          </div>

          {/* Graphical Representation & Seasonality Card */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-700" /> Demand Comparison
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-600">Current Weekly Demand: {forecast.currentWeeklyDemand.toLocaleString('en-IN')} kg</span>
                    <span className="text-gray-400">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-navy-800 h-4 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-primary-700">
                      Forecasted Demand: {forecast.predictedDemand.toLocaleString('en-IN')} kg
                    </span>
                    <span className="text-primary-700 font-bold">
                      {Math.round((forecast.predictedDemand / (forecast.currentWeeklyDemand || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-primary-600 h-4 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                {forecast.potentialShortage > 0 && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700">
                        Estimated Regional Shortage: {forecast.potentialShortage.toLocaleString('en-IN')} kg
                      </span>
                      <span className="text-amber-700 font-bold">Buffer alert</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-4 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Season Factor */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-navy-800" /> Seasonal Factor
              </h3>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs text-gray-500">Current Climate Season</p>
                <p className="text-xl font-bold text-navy-900">{forecast.season || 'Monsoon'}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Seasonal shifts impact crop maturity and harvest cycles in Western Maharashtra. Predictive adjustments account for local mandi arrivals.
                </p>
              </div>

              <div className="p-3 bg-primary-50 rounded-lg text-xs text-primary-900 space-y-1">
                <p className="font-semibold">Recommended Sourcing Strategy</p>
                <p className="text-primary-800">
                  {forecast.potentialShortage > 0
                    ? 'Proactively pre-book supply with Nashik and Pune FPOs to mitigate price spikes.'
                    : 'Standard procurement schedule recommended.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
