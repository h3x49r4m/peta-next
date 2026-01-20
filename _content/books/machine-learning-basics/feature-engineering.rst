---
title: "Feature Engineering"
---

Feature Engineering
===================

Feature engineering is the process of creating new features or transforming existing features to improve machine learning model performance. It's often said that "features and data matter more than algorithms" - good features can make even simple algorithms perform well.

What is Feature Engineering?
----------------------------

Feature engineering involves:

- **Creating new features** from existing data
- **Transforming features** to make them more suitable for ML algorithms
- **Selecting the most relevant features** for the model
- **Encoding categorical variables** into numerical format
- **Handling missing values** and outliers

The goal is to represent the underlying problem in a way that makes it easier for machine learning algorithms to learn patterns.

Types of Feature Engineering
----------------------------

1. **Numeric Features**: Scaling, normalization, binning
2. **Categorical Features**: One-hot encoding, label encoding
3. **Text Features**: TF-IDF, word embeddings
4. **Date/Time Features**: Extracting components, cyclical encoding
5. **Interaction Features**: Combining multiple features

Numeric Feature Engineering
---------------------------

Scaling and Normalization
~~~~~~~~~~~~~~~~~~~~~~~~~

Different algorithms require different scaling approaches:

.. code-block:: python

    from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
    import numpy as np
    
    # Sample data
    X = np.array([[1, 100], [2, 200], [3, 300], [4, 400]])
    
    # StandardScaler (z-score normalization)
    scaler = StandardScaler()
    X_standardized = scaler.fit_transform(X)
    
    # MinMaxScaler (scales to [0, 1])
    minmax = MinMaxScaler()
    X_normalized = minmax.fit_transform(X)
    
    # RobustScaler (uses median and IQR, robust to outliers)
    robust = RobustScaler()
    X_robust = robust.fit_transform(X)
    
    print("Original data:\n", X)
    print("Standardized:\n", X_standardized)
    print("Normalized:\n", X_normalized)
    print("Robust scaled:\n", X_robust)

Binning and Discretization
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Binning converts continuous variables into categorical ones:

.. code-block:: python

    from sklearn.preprocessing import KBinsDiscretizer
    
    # Create bins for age data
    ages = np.array([[18], [25], [35], [45], [55], [65], [75]])
    
    # Equal-width binning
    kbin = KBinsDiscretizer(n_bins=3, encode='ordinal', strategy='uniform')
    age_binned = kbin.fit_transform(ages)
    
    print("Original ages:", ages.flatten())
    print("Binned ages:", age_binned.flatten())

Log Transformation
~~~~~~~~~~~~~~~~~~

Log transformation helps handle skewed data:

.. code-block:: python

    import numpy as np
    
    # Skewed data (e.g., income)
    income = np.array([30000, 45000, 60000, 80000, 120000, 250000, 1000000])
    
    # Apply log transformation
    log_income = np.log1p(income)  # log1p handles zero values
    
    print("Original income:", income)
    print("Log transformed:", log_income)

.. snippet-card:: python-data-processing

Data preprocessing is a fundamental part of feature engineering.

The data processing techniques shown in our snippet, including handling missing values and scaling, are essential steps in creating good features for machine learning models.

Categorical Feature Engineering
------------------------------

One-Hot Encoding
~~~~~~~~~~~~~~~~

One-hot encoding creates binary columns for each category:

.. code-block:: python

    from sklearn.preprocessing import OneHotEncoder
    import pandas as pd
    
    # Sample categorical data
    categories = pd.DataFrame({'color': ['red', 'blue', 'green', 'red', 'blue']})
    
    # One-hot encode
    encoder = OneHotEncoder(sparse=False)
    one_hot_encoded = encoder.fit_transform(categories[['color']])
    
    # Create DataFrame with encoded columns
    encoded_df = pd.DataFrame(
        one_hot_encoded, 
        columns=encoder.get_feature_names_out(['color'])
    )
    
    print("Original:", categories['color'].values)
    print("One-hot encoded:\n", encoded_df)

Label Encoding
~~~~~~~~~~~~~~

Label encoding assigns unique integers to categories:

.. code-block:: python

    from sklearn.preprocessing import LabelEncoder
    
    # Sample data with ordinal relationship
    education = ['High School', 'Bachelor', 'Master', 'PhD', 'Bachelor']
    
    # Label encode
    le = LabelEncoder()
    education_encoded = le.fit_transform(education)
    
    print("Original:", education)
    print("Encoded:", education_encoded)
    print("Classes:", le.classes_)

Target Encoding
~~~~~~~~~~~~~~~

Target encoding uses target variable to encode categories:

.. code-block:: python

    import pandas as pd
    
    # Sample data with target
    df = pd.DataFrame({
        'city': ['A', 'B', 'A', 'C', 'B', 'A'],
        'price': [100, 150, 120, 200, 180, 110]
    })
    
    # Target encoding (mean price per city)
    target_encoded = df.groupby('city')['price'].mean()
    df['city_encoded'] = df['city'].map(target_encoded)
    
    print("Original data:\n", df)
    print("Target encoding mapping:\n", target_encoded)

Text Feature Engineering
------------------------

TF-IDF Vectorization
~~~~~~~~~~~~~~~~~~~~

Term Frequency-Inverse Document Frequency (TF-IDF) is commonly used for text features:

.. code-block:: python

    from sklearn.feature_extraction.text import TfidfVectorizer
    
    # Sample documents
    documents = [
        "Machine learning is fascinating",
        "Deep learning is a subset of machine learning",
        "Natural language processing uses machine learning",
        "Computer vision applications are growing"
    ]
    
    # Create TF-IDF features
    vectorizer = TfidfVectorizer(max_features=10, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    print("Feature names:", vectorizer.get_feature_names_out())
    print("TF-IDF matrix shape:", tfidf_matrix.shape)
    print("TF-IDF matrix:\n", tfidf_matrix.toarray())

N-grams and Word Embeddings
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    # Using n-grams
    vectorizer_ngrams = TfidfVectorizer(ngram_range=(1, 2), max_features=10)
    ngram_matrix = vectorizer_ngrams.fit_transform(documents)
    
    print("N-gram features:", vectorizer_ngrams.get_feature_names_out())

Date/Time Feature Engineering
-----------------------------

Extracting Components
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    import pandas as pd
    
    # Create sample date data
    dates = pd.date_range('2023-01-01', periods=5, freq='D')
    df = pd.DataFrame({'date': dates})
    
    # Extract various components
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['dayofweek'] = df['date'].dt.dayofweek
    df['quarter'] = df['date'].dt.quarter
    
    print("Date features:\n", df)

Cyclical Encoding
~~~~~~~~~~~~~~~~~

For cyclical features like time, use sine and cosine transformations:

.. code-block:: python

    import numpy as np
    
    # Cyclical encoding for months
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    # Cyclical encoding for day of week
    df['dayofweek_sin'] = np.sin(2 * np.pi * df['dayofweek'] / 7)
    df['dayofweek_cos'] = np.cos(2 * np.pi * df['dayofweek'] / 7)
    
    print("Cyclical encoding:\n", df[['month', 'month_sin', 'month_cos']].head())

Interaction Features
--------------------

Creating interaction features can capture relationships between variables:

.. code-block:: python

    import pandas as pd
    
    # Sample data
    df = pd.DataFrame({
        'height': [170, 175, 180, 165, 185],
        'weight': [70, 75, 80, 65, 85]
    })
    
    # Create interaction features
    df['height_weight_ratio'] = df['height'] / df['weight']
    df['bmi'] = df['weight'] / (df['height'] / 100) ** 2
    df['height_squared'] = df['height'] ** 2
    
    print("Original and interaction features:\n", df)

.. article-card:: calculus-fundamentals

Mathematical concepts, particularly from calculus and statistics, are fundamental to understanding feature engineering techniques.

Understanding distributions, transformations, and optimization helps in selecting and creating appropriate features for machine learning models.

Feature Selection
-----------------

Feature selection helps identify the most relevant features:

Filter Methods
~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.feature_selection import SelectKBest, f_classif
    from sklearn.datasets import make_classification
    
    # Generate sample data
    X, y = make_classification(n_samples=100, n_features=20, n_informative=5, random_state=42)
    
    # Select top 10 features using ANOVA F-value
    selector = SelectKBest(score_func=f_classif, k=10)
    X_selected = selector.fit_transform(X, y)
    
    print("Original features:", X.shape[1])
    print("Selected features:", X_selected.shape[1])
    print("Selected feature indices:", selector.get_support(indices=True))

Wrapper Methods
~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.feature_selection import RFE
    from sklearn.linear_model import LogisticRegression
    
    # Recursive Feature Elimination
    estimator = LogisticRegression(max_iter=1000)
    rfe = RFE(estimator=estimator, n_features_to_select=5)
    X_rfe = rfe.fit_transform(X, y)
    
    print("RFE selected features:", X_rfe.shape[1])
    print("Feature ranking:", rfe.ranking_)

Embedded Methods
~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.ensemble import RandomForestClassifier
    
    # Random Forest provides feature importance
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    # Get feature importances
    importances = rf.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print("Feature ranking:")
    for f in range(X.shape[1]):
        print(f"{f + 1}. Feature {indices[f]} ({importances[indices[f]]:.4f})")

Best Practices
--------------

1. **Domain Knowledge**: Use domain expertise to create meaningful features
2. **Iterative Process**: Feature engineering is iterative - experiment and refine
3. **Avoid Data Leakage**: Ensure feature engineering doesn't use future information
4. **Document Transformations**: Keep track of all transformations applied
5. **Validate Features**: Test feature importance and impact on model performance

Common Pitfalls
---------------

1. **Overfitting**: Creating too many features can lead to overfitting
2. **Data Leakage**: Using information from the future in feature creation
3. **Curse of Dimensionality**: Too many features can degrade performance
4. **Inconsistent Scaling**: Different scales can affect some algorithms
5. **Missing Value Mishandling**: Inappropriate handling of missing values

Conclusion
----------

Feature engineering is both an art and a science that requires creativity, domain knowledge, and systematic experimentation. Well-engineered features can significantly improve model performance and often make the difference between a mediocre and an excellent machine learning solution.

In the next chapter, we'll explore model evaluation techniques to assess how well our models perform.