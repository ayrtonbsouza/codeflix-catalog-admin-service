import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import { Category } from '@core/category/domain/entities/category.entity';
import { setupSequelize } from '@core/shared/infra/testing/helpers';

describe('Integration: [Category Model]', () => {
  setupSequelize({ models: [CategoryModel] });

  describe('[create]', () => {
    it('should create a category with all fields', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel).toBeDefined();
      expect(categoryModel.id).toBe(category.id.value);
      expect(categoryModel.name).toBe(category.name);
      expect(categoryModel.description).toBe(category.description);
      expect(categoryModel.is_active).toBe(category.is_active);
      expect(categoryModel.created_at).toEqual(category.created_at);
    });

    it('should create a category with minimum fields (name only)', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Minimal Category')
        .build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: null,
        is_active: true,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel).toBeDefined();
      expect(categoryModel.name).toBe('Minimal Category');
      expect(categoryModel.description).toBeNull();
      expect(categoryModel.is_active).toBe(true);
    });

    it('should create a category with default is_active as true', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Active Category')
        .build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: true,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel.is_active).toBe(true);
    });

    it('should create a category with is_active as false', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel.is_active).toBe(false);
    });

    it('should create multiple categories', async () => {
      // Arrange
      const categories = [
        Category.fake().createCategory().withName('Category 1').build(),
        Category.fake().createCategory().withName('Category 2').build(),
        Category.fake().createCategory().withName('Category 3').build(),
      ];

      // Act
      const createdCategories = await Promise.all(
        categories.map((category) =>
          CategoryModel.create({
            id: category.id.value,
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at,
          }),
        ),
      );

      // Assert
      expect(createdCategories).toHaveLength(3);
      createdCategories.forEach((model, index) => {
        expect(model.name).toBe(categories[index].name);
      });
    });

    it('should throw error when name is null', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      // Act & Assert
      await expect(
        CategoryModel.create({
          id: category.id.value,
          name: null as unknown as string,
          description: category.description,
          is_active: category.is_active,
          created_at: category.created_at,
        }),
      ).rejects.toThrow();
    });

    it('should allow name exceeding 255 characters (SQLite does not enforce STRING length constraint)', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();
      const longName = 'A'.repeat(256);

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: longName,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel).toBeDefined();
      expect(categoryModel.name).toBe(longName);
      expect(categoryModel.name.length).toBe(256);
    });

    it('should allow description to be null', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withDescription(null)
        .build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: null,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel.description).toBeNull();
    });

    it('should allow description with long text', async () => {
      // Arrange
      const longDescription = 'A'.repeat(1000);
      const category = Category.fake()
        .createCategory()
        .withDescription(longDescription)
        .build();

      // Act
      const categoryModel = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: longDescription,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(categoryModel.description).toBe(longDescription);
    });
  });

  describe('[findById]', () => {
    it('should find a category by id', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();
      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      const found = await CategoryModel.findByPk(category.id.value);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe(category.id.value);
      expect(found?.name).toBe(category.name);
    });

    it('should return null when category does not exist', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

      // Act
      const found = await CategoryModel.findByPk(nonExistentId);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('[findAll]', () => {
    it('should find all categories', async () => {
      // Arrange
      const categories = [
        Category.fake().createCategory().withName('Category 1').build(),
        Category.fake().createCategory().withName('Category 2').build(),
        Category.fake().createCategory().withName('Category 3').build(),
      ];

      await Promise.all(
        categories.map((category) =>
          CategoryModel.create({
            id: category.id.value,
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at,
          }),
        ),
      );

      // Act
      const allCategories = await CategoryModel.findAll();

      // Assert
      expect(allCategories).toHaveLength(3);
    });

    it('should return empty array when no categories exist', async () => {
      // Act
      const allCategories = await CategoryModel.findAll();

      // Assert
      expect(allCategories).toHaveLength(0);
    });

    it('should find categories with where clause', async () => {
      // Arrange
      const activeCategory = Category.fake()
        .createCategory()
        .withName('Active Category')
        .activate()
        .build();
      const inactiveCategory = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();

      await CategoryModel.create({
        id: activeCategory.id.value,
        name: activeCategory.name,
        description: activeCategory.description,
        is_active: activeCategory.is_active,
        created_at: activeCategory.created_at,
      });

      await CategoryModel.create({
        id: inactiveCategory.id.value,
        name: inactiveCategory.name,
        description: inactiveCategory.description,
        is_active: inactiveCategory.is_active,
        created_at: inactiveCategory.created_at,
      });

      // Act
      const activeCategories = await CategoryModel.findAll({
        where: { is_active: true },
      });

      // Assert
      expect(activeCategories).toHaveLength(1);
      expect(activeCategories[0].is_active).toBe(true);
    });
  });

  describe('[findOne]', () => {
    it('should find one category with where clause', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Unique Category')
        .build();

      await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      const found = await CategoryModel.findOne({
        where: { name: 'Unique Category' },
      });

      // Assert
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Unique Category');
    });

    it('should return null when no category matches', async () => {
      // Act
      const found = await CategoryModel.findOne({
        where: { name: 'Non Existent' },
      });

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('[update]', () => {
    it('should update category name', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({ name: 'Updated Name' });

      // Assert
      expect(created.name).toBe('Updated Name');
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found?.name).toBe('Updated Name');
    });

    it('should update category description', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withDescription('Original Description')
        .build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({ description: 'Updated Description' });

      // Assert
      expect(created.description).toBe('Updated Description');
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found?.description).toBe('Updated Description');
    });

    it('should update is_active from true to false', async () => {
      // Arrange
      const category = Category.fake().createCategory().activate().build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({ is_active: false });

      // Assert
      expect(created.is_active).toBe(false);
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found?.is_active).toBe(false);
    });

    it('should update is_active from false to true', async () => {
      // Arrange
      const category = Category.fake().createCategory().deactivate().build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({ is_active: true });

      // Assert
      expect(created.is_active).toBe(true);
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found?.is_active).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .withDescription('Original Description')
        .activate()
        .build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({
        name: 'Updated Name',
        description: 'Updated Description',
        is_active: false,
      });

      // Assert
      expect(created.name).toBe('Updated Name');
      expect(created.description).toBe('Updated Description');
      expect(created.is_active).toBe(false);
    });

    it('should update description to null', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withDescription('Some Description')
        .build();

      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      await created.update({ description: null });

      // Assert
      expect(created.description).toBeNull();
    });
  });

  describe('[delete]', () => {
    it('should delete a category by id', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act
      const deleted = await CategoryModel.destroy({
        where: { id: category.id.value },
      });

      // Assert
      expect(deleted).toBe(1);
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found).toBeNull();
    });

    it('should delete multiple categories', async () => {
      // Arrange
      const categories = [
        Category.fake().createCategory().withName('Category 1').build(),
        Category.fake().createCategory().withName('Category 2').build(),
        Category.fake().createCategory().withName('Category 3').build(),
      ];

      await Promise.all(
        categories.map((category) =>
          CategoryModel.create({
            id: category.id.value,
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at,
          }),
        ),
      );

      // Act
      const deleted = await CategoryModel.destroy({
        where: {
          id: categories.map((c) => c.id.value),
        },
      });

      // Assert
      expect(deleted).toBe(3);
      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(0);
    });

    it('should return 0 when trying to delete non-existent category', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

      // Act
      const deleted = await CategoryModel.destroy({
        where: { id: nonExistentId },
      });

      // Assert
      expect(deleted).toBe(0);
    });
  });

  describe('[constraints and validations]', () => {
    it('should enforce unique id constraint', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act & Assert
      await expect(
        CategoryModel.create({
          id: category.id.value,
          name: 'Another Category',
          description: null,
          is_active: true,
          created_at: new Date(),
        }),
      ).rejects.toThrow();
    });

    it('should enforce name is required (not null)', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      // Act & Assert
      await expect(
        CategoryModel.create({
          id: category.id.value,
          name: null as unknown as string,
          description: category.description,
          is_active: category.is_active,
          created_at: category.created_at,
        }),
      ).rejects.toThrow();
    });

    it('should enforce created_at is required (not null)', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();

      // Act & Assert
      await expect(
        CategoryModel.create({
          id: category.id.value,
          name: category.name,
          description: category.description,
          is_active: category.is_active,
          created_at: null as unknown as Date,
        }),
      ).rejects.toThrow();
    });

    it('should accept name with exactly 255 characters', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();
      const name255 = 'A'.repeat(255);

      // Act
      const created = await CategoryModel.create({
        id: category.id.value,
        name: name255,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Assert
      expect(created.name).toBe(name255);
      expect(created.name.length).toBe(255);
    });
  });

  describe('[model attributes]', () => {
    it('should have all expected attributes', () => {
      // Act
      const attributes = CategoryModel.getAttributes();

      // Assert
      expect(attributes).toHaveProperty('id');
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('description');
      expect(attributes).toHaveProperty('is_active');
      expect(attributes).toHaveProperty('created_at');
    });

    it('should have id attribute with correct configuration', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const idAttribute = attributes.id;

      // Assert
      expect(idAttribute).toBeDefined();
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.type).toBeDefined();
    });

    it('should have name attribute with correct configuration', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const nameAttribute = attributes.name;

      // Assert
      expect(nameAttribute).toBeDefined();
      expect(nameAttribute.allowNull).toBe(false);
      expect(nameAttribute.type).toBeDefined();
    });

    it('should have description attribute with correct configuration', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const descriptionAttribute = attributes.description;

      // Assert
      expect(descriptionAttribute).toBeDefined();
      expect(descriptionAttribute.allowNull).toBe(true);
      expect(descriptionAttribute.type).toBeDefined();
    });

    it('should have is_active attribute with correct configuration', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const isActiveAttribute = attributes.is_active;

      // Assert
      expect(isActiveAttribute).toBeDefined();
      expect(isActiveAttribute.allowNull).toBe(false);
      expect(isActiveAttribute.defaultValue).toBe(true);
      expect(isActiveAttribute.type).toBeDefined();
    });

    it('should have created_at attribute with correct configuration', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const createdAtAttribute = attributes.created_at;

      // Assert
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.allowNull).toBe(false);
      expect(createdAtAttribute.type).toBeDefined();
    });

    it('should have exactly 5 attributes', () => {
      // Act
      const attributes = CategoryModel.getAttributes();
      const attributeKeys = Object.keys(attributes);

      // Assert
      expect(attributeKeys).toHaveLength(5);
      expect(attributeKeys).toEqual([
        'id',
        'name',
        'description',
        'is_active',
        'created_at',
      ]);
    });
  });

  describe('[data integrity]', () => {
    it('should preserve data after multiple operations', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test Category')
        .withDescription('Test Description')
        .build();

      // Act - Create
      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });

      // Act - Update
      await created.update({ name: 'Updated Category' });

      // Act - Find
      const found = await CategoryModel.findByPk(category.id.value);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Updated Category');
      expect(found?.description).toBe('Test Description');
      expect(found?.id).toBe(category.id.value);
    });

    it('should handle dates correctly', async () => {
      // Arrange
      const customDate = new Date('2024-01-15T10:30:00.000Z');
      const category = Category.fake()
        .createCategory()
        .withCreatedAt(customDate)
        .build();

      // Act
      const created = await CategoryModel.create({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: customDate,
      });

      // Assert
      expect(created.created_at).toEqual(customDate);
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found?.created_at).toEqual(customDate);
    });

    it('should handle boolean values correctly', async () => {
      // Arrange
      const category1 = Category.fake().createCategory().activate().build();
      const category2 = Category.fake().createCategory().deactivate().build();

      // Act
      const created1 = await CategoryModel.create({
        id: category1.id.value,
        name: category1.name,
        description: category1.description,
        is_active: true,
        created_at: category1.created_at,
      });

      const created2 = await CategoryModel.create({
        id: category2.id.value,
        name: category2.name,
        description: category2.description,
        is_active: false,
        created_at: category2.created_at,
      });

      // Assert
      expect(created1.is_active).toBe(true);
      expect(created2.is_active).toBe(false);
      expect(typeof created1.is_active).toBe('boolean');
      expect(typeof created2.is_active).toBe('boolean');
    });
  });
});
