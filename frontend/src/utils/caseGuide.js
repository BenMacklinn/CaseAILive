export const caseGuide = {
  frameworks: {
    profitability: {
      title: "Profitability Framework",
      description: "<b>Analyze Revenue and Costs to Identify Profit Drivers</b>",
      structure: [
        `<div style="margin-bottom:8px;"><b style="color:#2563eb;">Revenue Analysis</b><ul style="margin:4px 0 8px 18px;padding:0;list-style:square inside;">
          <li><b>Market Size & Growth:</b> Assess total addressable market and trends.</li>
          <li><b>Market Share:</b> Determine your share and compare with competitors.</li>
          <li><b>Pricing Strategy:</b> Review current pricing, discounts, and positioning.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style="color:#8B38FF;">Cost Analysis</b><ul style="margin:4px 0 8px 18px;padding:0;list-style:square inside;">
          <li><b>Fixed Costs:</b> Recurring expenses (e.g., rent, salaries).</li>
          <li><b>Variable Costs:</b> Costs that scale with production (e.g., materials).</li>
          <li><b>Economies of Scale:</b> Opportunities to lower per-unit costs as volume increases.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style="color:#10b981;">Profit Levers</b><ul style="margin:4px 0 0 18px;padding:0;list-style:square inside;">
          <li><b style="color:#2563eb;">Increase Prices</b> — If the market allows, raise prices to boost margins.</li>
          <li><b style="color:#10b981;">Reduce Costs</b> — Cut unnecessary expenses or negotiate better rates.</li>
          <li><b style="color:#8B38FF;">Increase Volume</b> — Grow sales through new customers or higher usage.</li>
        </ul></div>`
      ]
    },
    marketEntry: {
      title: "Market Entry Framework",
      description: "<b>Evaluate Market Attractiveness and Entry Strategy</b>",
      structure: [
        `<div style="margin-bottom:8px;"><b style=\"color:#2563eb;\">Market Analysis</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Market Size & Growth:</b> Assess the size and recent growth of the target market.</li>
          <li><b>Customer Segments:</b> Identify and prioritize key customer groups.</li>
          <li><b>Competition:</b> Analyze main competitors and their market share.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style=\"color:#8B38FF;\">Company Capabilities</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Resources & Capabilities:</b> Assess internal strengths and weaknesses.</li>
          <li><b>Competitive Advantage:</b> Identify unique value propositions.</li>
          <li><b>Strategic Fit:</b> Ensure alignment with company goals.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style=\"color:#10b981;\">Entry Strategy</b><ul style=\"margin:4px 0 0 18px;padding:0;list-style:square inside;\">
          <li><b>Entry Mode:</b> Organic, acquisition, or partnership?</li>
          <li><b>Timing:</b> When is the optimal time to enter?</li>
          <li><b>Risk Assessment:</b> Identify and mitigate key risks.</li>
        </ul></div>`
      ]
    },
    pricingFramework: {
      title: "Pricing Framework",
      description: "<b>Determine Optimal Pricing Strategy</b>",
      structure: [
        `<div style="margin-bottom:8px;"><b style=\"color:#2563eb;\">Cost Analysis</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Fixed Costs:</b> Identify recurring expenses.</li>
          <li><b>Variable Costs:</b> Understand costs that scale with sales.</li>
          <li><b>Break-even Point:</b> Calculate the minimum sales needed for profit.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style=\"color:#8B38FF;\">Customer Analysis</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Willingness to Pay:</b> Gauge customer price sensitivity.</li>
          <li><b>Price Sensitivity:</b> Assess how demand changes with price.</li>
          <li><b>Value Perception:</b> Understand perceived value vs. competitors.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style=\"color:#10b981;\">Competitive Analysis</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Competitor Pricing:</b> Compare with main competitors.</li>
          <li><b>Market Position:</b> Identify your place in the market.</li>
          <li><b>Price Wars Risk:</b> Assess likelihood and impact of price wars.</li>
        </ul></div>`,
        `<div style="margin-bottom:8px;"><b style=\"color:#2563eb;\">Pricing Strategy</b><ul style=\"margin:4px 0 0 18px;padding:0;list-style:square inside;\">
          <li><b>Cost-plus:</b> Add a markup to costs.</li>
          <li><b>Value-based:</b> Price based on customer value.</li>
          <li><b>Competitive Pricing:</b> Match or beat competitors.</li>
        </ul></div>`
      ]
    }
  },
  formulas: {
    profit: {
      title: "Profit Formulas",
      items: [
        `<div style="margin-bottom:8px;"><b style=\"color:#2563eb;\">Profit</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Profit = Revenue - Costs</b></li>
          <li><b>Gross Profit = Revenue - COGS</b></li>
          <li><b>Operating Profit = Gross Profit - Operating Expenses</b></li>
          <li><b>Net Profit = Operating Profit - Taxes - Interest</b></li>
        </ul></div>`
      ]
    },
    market: {
      title: "Market Analysis Formulas",
      items: [
        `<div style="margin-bottom:8px;"><b style=\"color:#8B38FF;\">Market Analysis</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Market Share = Company Sales / Total Market Sales</b></li>
          <li><b>Growth Rate = (Current Value - Previous Value) / Previous Value</b></li>
          <li><b>CAGR = (End Value / Start Value)^(1/n) - 1</b></li>
          <li><b>Penetration Rate = Current Users / Total Addressable Market</b></li>
        </ul></div>`
      ]
    },
    pricingFormulas: {
      title: "Pricing Formulas",
      items: [
        `<div style="margin-bottom:8px;"><b style=\"color:#10b981;\">Pricing</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li><b>Break-even Point = Fixed Costs / (Price - Variable Cost per Unit)</b></li>
          <li><b>Contribution Margin = Price - Variable Cost per Unit</b></li>
          <li><b>Markup = (Selling Price - Cost) / Cost</b></li>
          <li><b>Price Elasticity = % Change in Quantity / % Change in Price</b></li>
        </ul></div>`
      ]
    }
  },
  tips: {
    structure: {
      title: "Structure Tips",
      items: [
        `<span style=\"color:#2563eb;\"><b>Start with a clear framework</b></span> — Organize your approach before diving in.`,
        `<span style=\"color:#8B38FF;\"><b>Break down problems</b></span> — Tackle issues in manageable parts.`,
        `<span style=\"color:#10b981;\"><b>Use MECE</b></span> — Ensure your structure is Mutually Exclusive, Collectively Exhaustive.`,
        `<span style=\"color:#2563eb;\"><b>Prioritize key drivers</b></span> — Focus on what matters most.`,
        `<span style=\"color:#8B38FF;\"><b>Quantify when possible</b></span> — Use numbers to support your points.`
      ]
    },
    communication: {
      title: "Communication Tips",
      items: [
        `<span style=\"color:#2563eb;\"><b>Be clear and concise</b></span> — Get to the point quickly.`,
        `<span style=\"color:#8B38FF;\"><b>Use the STAR method</b></span> — Situation, Task, Action, Result.`,
        `<span style=\"color:#10b981;\"><b>Maintain eye contact</b></span> — Show confidence and engagement.`,
        `<span style=\"color:#2563eb;\"><b>Speak at a moderate pace</b></span> — Ensure clarity and understanding.`,
        `<span style=\"color:#8B38FF;\"><b>Use business terminology</b></span> — Demonstrate professionalism.`
      ]
    },
    math: {
      title: "Math Tips",
      items: [
        `<span style=\"color:#2563eb;\"><b>Round numbers</b></span> — Make calculations faster.`,
        `<span style=\"color:#8B38FF;\"><b>Use 10% as a benchmark</b></span> — Quick checks for reasonableness.`,
        `<span style=\"color:#10b981;\"><b>Break down calculations</b></span> — Simplify complex math.`,
        "Round numbers for quick calculations",
        "Use 10% as a benchmark",
        "Break down complex calculations",
        "Double-check your work",
        "Explain your approach"
      ]
    }
  },
  industries: {
    tech: {
      title: "Tech Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Monthly Active Users (MAU)</li>
          <li>Customer Acquisition Cost (CAC)</li>
          <li>Lifetime Value (LTV)</li>
          <li>Churn Rate</li>
          <li>Average Revenue Per User (ARPU)</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Cloud computing</li>
          <li>AI and machine learning</li>
          <li>Cybersecurity</li>
          <li>Digital transformation</li>
          <li>Subscription models</li>
        </ul></div>`
      ]
    },
    retail: {
      title: "Retail Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Same Store Sales Growth</li>
          <li>Inventory Turnover</li>
          <li>Gross Margin</li>
          <li>Sales per Square Foot</li>
          <li>Customer Traffic</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>E-commerce growth</li>
          <li>Omnichannel retail</li>
          <li>Personalization</li>
          <li>Sustainability</li>
          <li>Experiential retail</li>
        </ul></div>`
      ]
    },
    healthcare: {
      title: "Healthcare Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Patient Volume</li>
          <li>Average Revenue per Patient</li>
          <li>Length of Stay</li>
          <li>Readmission Rate</li>
          <li>Operating Margin</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Telemedicine</li>
          <li>Value-based care</li>
          <li>Digital health</li>
          <li>Precision medicine</li>
          <li>Healthcare analytics</li>
        </ul></div>`
      ]
    },
    general: {
      title: "General Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Revenue Growth</li>
          <li>Market Share</li>
          <li>Profit Margin</li>
          <li>Customer Satisfaction</li>
          <li>Operating Efficiency</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Digital transformation</li>
          <li>Globalization</li>
          <li>Regulatory changes</li>
          <li>Sustainability initiatives</li>
          <li>Customer-centric strategies</li>
        </ul></div>`
      ]
    },
    finance: {
      title: "Finance Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Return on Equity (ROE)</li>
          <li>Net Interest Margin</li>
          <li>Cost-to-Income Ratio</li>
          <li>Non-Performing Loan Ratio</li>
          <li>Capital Adequacy Ratio</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Fintech disruption</li>
          <li>Regulatory technology (RegTech)</li>
          <li>Digital banking</li>
          <li>Blockchain adoption</li>
          <li>ESG investing</li>
        </ul></div>`
      ]
    },
    energy: {
      title: "Energy Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Production Volume</li>
          <li>Capacity Utilization</li>
          <li>Operating Cost per Unit</li>
          <li>Reserve Replacement Ratio</li>
          <li>Carbon Emissions</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Renewable energy growth</li>
          <li>Energy storage innovation</li>
          <li>Grid modernization</li>
          <li>Decarbonization</li>
          <li>Electrification of transport</li>
        </ul></div>`
      ]
    },
    consumer_goods: {
      title: "Consumer Goods Industry",
      keyMetrics: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#2563eb;\">Key Metrics</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>Market Penetration</li>
          <li>Brand Equity</li>
          <li>Inventory Turnover</li>
          <li>Gross Margin</li>
          <li>Customer Retention Rate</li>
        </ul></div>`
      ],
      trends: [
        `<div style=\"margin-bottom:8px;\"><b style=\"color:#8B38FF;\">Current Trends</b><ul style=\"margin:4px 0 8px 18px;padding:0;list-style:square inside;\">
          <li>E-commerce expansion</li>
          <li>Personalization</li>
          <li>Sustainable packaging</li>
          <li>Direct-to-consumer models</li>
          <li>Health & wellness focus</li>
        </ul></div>`
      ]
    }
  }
}; 