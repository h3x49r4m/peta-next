---
title: "Model Evaluation"
---

Model Evaluation
=================

Model evaluation is a critical step in the machine learning pipeline. It helps us understand how well our models perform, identify potential issues, and make informed decisions about model selection and deployment.

Why Model Evaluation Matters
----------------------------

Proper model evaluation helps us:

- **Assess Performance**: Quantify how well the model performs on unseen data
- **Compare Models**: Choose the best model among multiple candidates
- **Detect Problems**: Identify overfitting, underfitting, or other issues
- **Guide Improvements**: Provide insights for model optimization
- **Ensure Reliability**: Build confidence in model predictions

Train-Test Split
----------------

The fundamental concept in model evaluation is splitting data into training and testing sets:

.. code-block:: python

    from sklearn.model_selection import train_test_split
    from sklearn.datasets import make_classification
    import numpy as np
    
    # Generate sample data
    X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set shape: {X_train.shape}")
    print(f"Testing set shape: {X_test.shape}")
    print(f"Training set class distribution: {np.bincount(y_train)}")
    print(f"Testing set class distribution: {np.bincount(y_test)}")

Cross-Validation
----------------

Cross-validation provides a more robust evaluation by using multiple train-test splits:

K-Fold Cross-Validation
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.model_selection import cross_val_score
    from sklearn.linear_model import LogisticRegression
    
    # Create model
    model = LogisticRegression(max_iter=1000, random_state=42)
    
    # Perform 5-fold cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Mean CV score: {cv_scores.mean():.4f}")
    print(f"Standard deviation: {cv_scores.std():.4f}")

Stratified K-Fold Cross-Validation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Stratified cross-validation maintains class distribution in each fold:

.. code-block:: python

    from sklearn.model_selection import StratifiedKFold
    
    # Create stratified K-fold cross-validator
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # Perform stratified cross-validation
    stratified_scores = cross_val_score(model, X, y, cv=skf, scoring='accuracy')
    
    print(f"Stratified CV scores: {stratified_scores}")
    print(f"Mean stratified CV score: {stratified_scores.mean():.4f}")

Classification Metrics
----------------------

Accuracy
~~~~~~~~

Accuracy is the most straightforward metric:

.. code-block:: python

    from sklearn.metrics import accuracy_score
    from sklearn.model_selection import train_test_split
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")

Confusion Matrix
~~~~~~~~~~~~~~~~

The confusion matrix provides detailed classification results:

.. code-block:: python

    from sklearn.metrics import confusion_matrix, classification_report
    import seaborn as sns
    import matplotlib.pyplot as plt
    
    # Create confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    print("Confusion Matrix:")
    print(cm)
    
    # Visualize confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.show()
    
    # Detailed classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

Precision, Recall, and F1-Score
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.metrics import precision_score, recall_score, f1_score
    
    # Calculate metrics
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-Score: {f1:.4f}")

ROC Curve and AUC
~~~~~~~~~~~~~~~~~

ROC (Receiver Operating Characteristic) curve and AUC (Area Under Curve):

.. code-block:: python

    from sklearn.metrics import roc_curve, auc, roc_auc_score
    
    # Get prediction probabilities
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Calculate ROC curve
    fpr, tpr, thresholds = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    
    print(f"ROC AUC Score: {roc_auc:.4f}")
    
    # Plot ROC curve
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.show()

Regression Metrics
-----------------

Mean Absolute Error (MAE)
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.metrics import mean_absolute_error
    from sklearn.datasets import make_regression
    from sklearn.linear_model import LinearRegression
    
    # Generate regression data
    X_reg, y_reg = make_regression(n_samples=1000, n_features=10, noise=0.1, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
    
    # Train regression model
    reg_model = LinearRegression()
    reg_model.fit(X_train, y_train)
    y_pred = reg_model.predict(X_test)
    
    # Calculate MAE
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Mean Absolute Error: {mae:.4f}")

Mean Squared Error (MSE) and Root Mean Squared Error (RMSE)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.metrics import mean_squared_error
    
    # Calculate MSE and RMSE
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"Root Mean Squared Error: {rmse:.4f}")

R-squared (Coefficient of Determination)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from sklearn.metrics import r2_score
    
    # Calculate R-squared
    r2 = r2_score(y_test, y_pred)
    print(f"R-squared: {r2:.4f}")

.. snippet-card:: python-data-processing

Data preprocessing and feature engineering directly impact model evaluation metrics.

Proper data preprocessing, as shown in our snippet, ensures that evaluation metrics accurately reflect model performance rather than data quality issues.

Hyperparameter Tuning
--------------------

Grid Search
~~~~~~~~~~~

Grid search exhaustively searches over specified parameter values:

.. code-block:: python

    from sklearn.model_selection import GridSearchCV
    from sklearn.ensemble import RandomForestClassifier
    
    # Define parameter grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10]
    }
    
    # Create grid search
    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring='accuracy',
        n_jobs=-1
    )
    
    # Fit grid search
    grid_search.fit(X_train, y_train)
    
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best cross-validation score: {grid_search.best_score_:.4f}")
    print(f"Test set score: {grid_search.score(X_test, y_test):.4f}")

Random Search
~~~~~~~~~~~~~

Random search samples parameter combinations randomly:

.. code-block:: python

    from sklearn.model_selection import RandomizedSearchCV
    from scipy.stats import randint
    
    # Define parameter distributions
    param_dist = {
        'n_estimators': randint(50, 200),
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': randint(2, 11)
    }
    
    # Create random search
    random_search = RandomizedSearchCV(
        RandomForestClassifier(random_state=42),
        param_dist,
        n_iter=20,
        cv=5,
        scoring='accuracy',
        random_state=42,
        n_jobs=-1
    )
    
    # Fit random search
    random_search.fit(X_train, y_train)
    
    print(f"Best parameters: {random_search.best_params_}")
    print(f"Best cross-validation score: {random_search.best_score_:.4f}")

.. article-card:: calculus-fundamentals

Understanding calculus is essential for optimizing machine learning models through gradient-based methods.

Many hyperparameter tuning techniques, especially for neural networks, rely on calculus concepts like gradient descent to find optimal parameter values.

Learning Curves
---------------

Learning curves help diagnose model performance issues:

.. code-block:: python

    from sklearn.model_selection import learning_curve
    import numpy as np
    
    # Generate learning curve data
    train_sizes, train_scores, test_scores = learning_curve(
        model, X, y, cv=5, n_jobs=-1, 
        train_sizes=np.linspace(0.1, 1.0, 10),
        scoring='accuracy'
    )
    
    # Calculate mean and standard deviation
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)
    
    # Plot learning curve
    plt.figure(figsize=(10, 6))
    plt.plot(train_sizes, train_mean, 'o-', color='blue', label='Training score')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color='blue')
    plt.plot(train_sizes, test_mean, 'o-', color='red', label='Cross-validation score')
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.1, color='red')
    plt.xlabel('Training examples')
    plt.ylabel('Score')
    plt.title('Learning Curve')
    plt.legend(loc='best')
    plt.grid(True)
    plt.show()

Validation Curves
-----------------

Validation curves show the effect of a single hyperparameter:

.. code-block:: python

    from sklearn.model_selection import validation_curve
    
    # Generate validation curve for n_estimators
    param_range = [10, 50, 100, 150, 200, 250]
    train_scores, test_scores = validation_curve(
        RandomForestClassifier(random_state=42),
        X, y,
        param_name='n_estimators',
        param_range=param_range,
        cv=5,
        scoring='accuracy',
        n_jobs=-1
    )
    
    # Calculate mean and standard deviation
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)
    
    # Plot validation curve
    plt.figure(figsize=(10, 6))
    plt.plot(param_range, train_mean, 'o-', color='blue', label='Training score')
    plt.fill_between(param_range, train_mean - train_std, train_mean + train_std, alpha=0.1, color='blue')
    plt.plot(param_range, test_mean, 'o-', color='red', label='Cross-validation score')
    plt.fill_between(param_range, test_mean - test_std, test_mean + test_std, alpha=0.1, color='red')
    plt.xlabel('Number of Estimators')
    plt.ylabel('Score')
    plt.title('Validation Curve')
    plt.legend(loc='best')
    plt.grid(True)
    plt.show()

Model Comparison
----------------

Comparing multiple models helps select the best performer:

.. code-block:: python

    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.svm import SVC
    from sklearn.neighbors import KNeighborsClassifier
    
    # Define models to compare
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'SVM': SVC(random_state=42),
        'KNN': KNeighborsClassifier()
    }
    
    # Evaluate each model
    results = {}
    for name, model in models.items():
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
        results[name] = {
            'mean': cv_scores.mean(),
            'std': cv_scores.std()
        }
        print(f"{name}: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Visualize results
    names = list(results.keys())
    means = [results[name]['mean'] for name in names]
    stds = [results[name]['std'] for name in names]
    
    plt.figure(figsize=(12, 6))
    plt.bar(names, means, yerr=stds, capsize=5, alpha=0.7)
    plt.ylabel('Accuracy')
    plt.title('Model Comparison')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

Best Practices
--------------

1. **Use Proper Validation**: Always use cross-validation for robust evaluation
2. **Multiple Metrics**: Evaluate using multiple appropriate metrics
3. **Baseline Models**: Compare against simple baseline models
4. **Statistical Significance**: Use statistical tests when comparing models
5. **Domain-Specific Evaluation**: Consider domain-specific evaluation criteria

Common Pitfalls
---------------

1. **Data Leakage**: Using test data in training or feature engineering
2. **Overfitting to Validation Set**: Tuning too much on validation data
3. **Ignoring Class Imbalance**: Not accounting for imbalanced classes
4. **Wrong Metrics**: Using inappropriate evaluation metrics
5. **Not Considering Business Impact**: Focusing only on technical metrics

Conclusion
----------

Model evaluation is essential for building reliable and effective machine learning systems. By using proper evaluation techniques, understanding different metrics, and following best practices, we can build models that perform well in real-world scenarios.

In the final chapter, we'll summarize key concepts and discuss future directions in machine learning.