export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Social Trend AI Platform API",
    version: "1.2.0",
    description: "Production REST API for real-time social trend forecasting, 4-model NLP sentiment benchmark against ground truth, and Gemini-driven content ideation.",
    contact: {
      name: "Social Trend AI Team",
      email: "support@socialtrend.ai"
    }
  },
  servers: [
    {
      url: "/",
      description: "Primary Server"
    }
  ],
  paths: {
    "/api/status": {
      get: {
        summary: "Get System & Architecture Status",
        description: "Returns connectivity status for Cloud SQL PostgreSQL, Gemini 3.8 Flash, and ingestion crawlers.",
        responses: {
          "200": {
            description: "System capability matrix",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hasGemini: { type: "boolean" },
                    hasDatabase: { type: "boolean" },
                    databaseEngine: { type: "string", example: "PostgreSQL (Cloud SQL)" },
                    mode: { type: "string", enum: ["live-augmented", "simulated"] }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/trends": {
      get: {
        summary: "List Social Trends & ML Forecasts",
        description: "Fetches social media trends with dynamic polynomial regression momentum vectors and confidence bounds from PostgreSQL.",
        parameters: [
          {
            name: "platform",
            in: "query",
            schema: { type: "string", enum: ["all", "reddit", "youtube", "twitter", "tiktok"] },
            description: "Platform filter"
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Category filter (e.g., Tech & AI, Gaming, Creator Economy)"
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search keyword in title, summary, or topics"
          }
        ],
        responses: {
          "200": {
            description: "Array of categorized trends with ML vectors",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    trends: { type: "array", items: { type: "object" } },
                    total: { type: "integer" },
                    source: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/analyze-topic": {
      post: {
        summary: "Analyze Topic via Gemini & Compute ML Forecast",
        description: "Takes an emerging topic keyword, queries LLM context extraction, estimates momentum slope, and stores in Cloud SQL.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["topic"],
                properties: {
                  topic: { type: "string", example: "Autonomous AI Agents" },
                  platform: { type: "string", example: "reddit" },
                  category: { type: "string", example: "Tech & AI" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Synthesized trend object with ML time series and virality probability"
          }
        }
      }
    },
    "/api/evaluate-sentiment": {
      post: {
        summary: "Multi-Model Sentiment Benchmark with Ground Truth",
        description: "Evaluates input text against VADER, RoBERTa, DistilBERT, and Gemini 3.8 Flash, validating against human ground truth with qualitative error diagnostics.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", example: "The new protocol lets AI control any app on your computer in 3 lines of code!" },
                  trendTitle: { type: "string" },
                  trendId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Benchmark comparison matrix with agreement percentage and error analysis"
          }
        }
      }
    },
    "/api/predict-ml": {
      post: {
        summary: "Quantitative ML Forecasting & Accuracy Metrics",
        description: "Performs polynomial regression and returns quantitative backtested metrics: RMSE, MAE, MAPE, R², Precision, Recall, and F1-score.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  score: { type: "number", example: 85 },
                  category: { type: "string", example: "Tech & AI" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Time-series projection and empirical evaluation report"
          }
        }
      }
    },
    "/api/generate-ideas": {
      post: {
        summary: "Generate Multi-Format Viral Content Ideas",
        description: "Produces 3 high-impact content scripts across Shorts/Reels, Viral Threads, and Long Video formats with psychological hooks.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["trendTitle"],
                properties: {
                  trendTitle: { type: "string" },
                  category: { type: "string" },
                  platform: { type: "string" },
                  creatorNiche: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Structured content outlines, hooks, and optimal posting times"
          }
        }
      }
    }
  }
};
