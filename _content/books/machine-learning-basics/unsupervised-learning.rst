---
title: "Unsupervised Learning"
---

Unsupervised Learning
=====================

Unsupervised learning is a type of machine learning where algorithms work with unlabeled data to discover hidden patterns, structures, or relationships. Unlike supervised learning, there are no predefined correct answers or output labels to guide the learning process.

What is Unsupervised Learning?
------------------------------

In unsupervised learning, we have input data (X) but no corresponding output labels (y). The goal is to explore the data and find meaningful patterns or structures within it.

The main objectives of unsupervised learning include:

- **Pattern Discovery**: Finding hidden patterns in data
- **Dimensionality Reduction**: Reducing the number of features while preserving important information
- **Clustering**: Grouping similar data points together
- **Anomaly Detection**: Identifying unusual or outliers in data

Types of Unsupervised Learning
------------------------------

1. **Clustering**: Grouping similar data points
2. **Dimensionality Reduction**: Reducing feature space
3. **Association Rule Learning**: Discovering relationships between variables
4. **Anomaly Detection**: Identifying outliers

Clustering
----------

Clustering is the task of grouping similar data points together based on their characteristics.

Common clustering algorithms:

K-Means Clustering
~~~~~~~~~~~~~~~~~~

K-Means is one of the most popular clustering algorithms:

.. code-block:: python

    from sklearn.cluster import KMeans
    import numpy as np
    
    # Generate sample data
    X = np.random.rand(100, 2)
    
    # Create K-Means model
    kmeans = KMeans(n_clusters=3, random_state=42)
    
    # Fit the model
    kmeans.fit(X)
    
    # Get cluster assignments
    labels = kmeans.labels_
    centers = kmeans.cluster_centers_
    
    print(f"Cluster labels: {labels[:10]}")
    print(f"Cluster centers:\n{centers}")

Hierarchical Clustering
~~~~~~~~~~~~~~~~~~~~~~~

Hierarchical clustering creates a tree-like structure of clusters:

.. code-block:: python

    from sklearn.cluster import AgglomerativeClustering
    import matplotlib.pyplot as plt
    
    # Create hierarchical clustering model
    hierarchical = AgglomerativeClustering(n_clusters=3)
    
    # Fit the model
    labels = hierarchical.fit_predict(X)
    
    # Plot dendrogram to visualize hierarchy
    from scipy.cluster.hierarchy import dendrogram, linkage
    Z = linkage(X, method='ward')
    dendrogram(Z)
    plt.show()

DBSCAN (Density-Based Spatial Clustering)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

DBSCAN identifies clusters based on density:

.. code-block:: python

    from sklearn.cluster import DBSCAN
    
    # Create DBSCAN model
    dbscan = DBSCAN(eps=0.3, min_samples=5)
    
    # Fit the model
    labels = dbscan.fit_predict(X)
    
    # -1 indicates noise points
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    print(f"Number of clusters: {n_clusters}")

Dimensionality Reduction
------------------------

Dimensionality reduction techniques reduce the number of features while preserving important information.

Principal Component Analysis (PCA)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

PCA is a linear dimensionality reduction technique:

.. code-block:: python

    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler
    
    # Standardize the data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Apply PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
    print(f"Original shape: {X.shape}")
    print(f"Reduced shape: {X_pca.shape}")

t-SNE (t-Distributed Stochastic Neighbor Embedding)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

t-SNE is particularly useful for visualizing high-dimensional data:

.. code-block:: python

    from sklearn.manifold import TSNE
    
    # Apply t-SNE
    tsne = TSNE(n_components=2, random_state=42)
    X_tsne = tsne.fit_transform(X)
    
    print(f"t-SNE shape: {X_tsne.shape}")

.. snippet-card:: python-data-processing

Data preprocessing is crucial for unsupervised learning algorithms.

For clustering and dimensionality reduction, we need to properly scale features, handle missing values, and remove outliers that can affect the algorithm performance.

Association Rule Learning
------------------------

Association rule learning discovers relationships between variables in large datasets.

Apriori Algorithm
~~~~~~~~~~~~~~~~~

The Apriori algorithm is used for market basket analysis:

.. code-block:: python

    from mlxtend.frequent_patterns import apriori
    from mlxtend.frequent_patterns import association_rules
    import pandas as pd
    
    # Sample transaction data
    transactions = [
        ['milk', 'bread', 'butter'],
        ['bread', 'butter'],
        ['milk', 'bread'],
        ['milk', 'butter'],
        ['bread', 'milk', 'butter', 'eggs']
    ]
    
    # Convert to one-hot encoded format
    from mlxtend.preprocessing import TransactionEncoder
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    
    # Find frequent itemsets
    frequent_itemsets = apriori(df, min_support=0.6, use_colnames=True)
    
    # Generate association rules
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.7)
    
    print(f"Frequent itemsets:\n{frequent_itemsets}")
    print(f"\nAssociation rules:\n{rules}")

Anomaly Detection
-----------------

Anomaly detection identifies unusual patterns that don't conform to expected behavior.

Isolation Forest
~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.ensemble import IsolationForest
    
    # Create Isolation Forest model
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    
    # Fit the model and predict anomalies
    anomaly_labels = iso_forest.fit_predict(X)
    
    # -1 indicates anomalies, 1 indicates normal points
    anomalies = X[anomaly_labels == -1]
    print(f"Number of anomalies detected: {len(anomalies)}")

.. article-card:: calculus-fundamentals

Mathematical foundations, particularly linear algebra and optimization, are essential for understanding unsupervised learning algorithms.

Many unsupervised learning algorithms, like PCA and K-Means, rely on optimization techniques that use calculus to find optimal solutions.

Evaluating Unsupervised Learning
--------------------------------

Evaluating unsupervised learning is challenging without ground truth labels. Common evaluation methods include:

Clustering Evaluation:
- **Silhouette Score**: Measures how similar an object is to its own cluster
- **Davies-Bouldin Index**: Measures the average similarity between clusters
- **Calinski-Harabasz Index**: Ratio of between-cluster to within-cluster dispersion

Dimensionality Reduction Evaluation:
- **Reconstruction Error**: How well the reduced data can be reconstructed
- **Explained Variance**: Amount of variance preserved by reduced dimensions

Real-World Applications
------------------------

Customer Segmentation
~~~~~~~~~~~~~~~~~~~~~~

- Grouping customers based on purchasing behavior
- Personalizing marketing campaigns
- Identifying high-value customer segments

Document Clustering
~~~~~~~~~~~~~~~~~~~

- Organizing news articles by topic
- Grouping research papers by subject
- Content recommendation systems

Image Compression
~~~~~~~~~~~~~~~~~

- Reducing image file sizes while preserving quality
- Feature extraction for computer vision tasks
- Data visualization

Anomaly Detection in Security
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Detecting fraudulent transactions
- Identifying network intrusions
- Monitoring system health

Best Practices
--------------

1. **Understand Your Data**: Explore data characteristics before choosing algorithms
2. **Preprocess Carefully**: Scale features and handle missing values appropriately
3. **Choose Right Metrics**: Select appropriate evaluation metrics for your task
4. **Visualize Results**: Use visualization to understand clustering and dimensionality reduction
5. **Iterate and Refine**: Experiment with different algorithms and parameters

Conclusion
----------

Unsupervised learning is a powerful tool for discovering hidden patterns and structures in data. By mastering clustering, dimensionality reduction, and other unsupervised techniques, you can extract valuable insights from unlabeled data.

In the next chapter, we'll explore feature engineering, a critical step in preparing data for machine learning models.