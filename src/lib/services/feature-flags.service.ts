import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FeatureFlagData {
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetPlan?: string;
}

export class FeatureFlagsService {
  /**
   * Get all feature flags
   */
  static async getAllFeatures() {
    try {
      const features = await prisma.featureFlag.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: features
      };
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return {
        success: false,
        error: 'Failed to fetch feature flags'
      };
    }
  }

  /**
   * Get a single feature flag
   */
  static async getFeature(id: string) {
    try {
      const feature = await prisma.featureFlag.findUnique({
        where: { id }
      });

      if (!feature) {
        return {
          success: false,
          error: 'Feature flag not found'
        };
      }

      return {
        success: true,
        data: feature
      };
    } catch (error) {
      console.error('Error fetching feature flag:', error);
      return {
        success: false,
        error: 'Failed to fetch feature flag'
      };
    }
  }

  /**
   * Create a new feature flag
   */
  static async createFeature(data: FeatureFlagData) {
    try {
      // Check if feature with same name exists
      const existing = await prisma.featureFlag.findUnique({
        where: { name: data.name }
      });

      if (existing) {
        return {
          success: false,
          error: 'Feature flag with this name already exists'
        };
      }

      const feature = await prisma.featureFlag.create({
        data: {
          name: data.name,
          description: data.description,
          isEnabled: data.isEnabled,
          rolloutPercentage: data.rolloutPercentage,
          targetPlan: data.targetPlan
        }
      });

      return {
        success: true,
        data: feature,
        message: 'Feature flag created successfully'
      };
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return {
        success: false,
        error: 'Failed to create feature flag'
      };
    }
  }

  /**
   * Update a feature flag
   */
  static async updateFeature(id: string, data: Partial<FeatureFlagData>) {
    try {
      const feature = await prisma.featureFlag.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: feature,
        message: 'Feature flag updated successfully'
      };
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return {
        success: false,
        error: 'Failed to update feature flag'
      };
    }
  }

  /**
   * Delete a feature flag
   */
  static async deleteFeature(id: string) {
    try {
      await prisma.featureFlag.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Feature flag deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      return {
        success: false,
        error: 'Failed to delete feature flag'
      };
    }
  }

  /**
   * Toggle feature flag (enable/disable)
   */
  static async toggleFeature(id: string) {
    try {
      const feature = await prisma.featureFlag.findUnique({
        where: { id }
      });

      if (!feature) {
        return {
          success: false,
          error: 'Feature flag not found'
        };
      }

      const updated = await prisma.featureFlag.update({
        where: { id },
        data: {
          isEnabled: !feature.isEnabled,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updated,
        message: `Feature flag ${updated.isEnabled ? 'enabled' : 'disabled'}`
      };
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      return {
        success: false,
        error: 'Failed to toggle feature flag'
      };
    }
  }

  /**
   * Check if a feature is enabled for a user
   */
  static async isFeatureEnabled(
    featureName: string,
    userPlan?: string
  ): Promise<boolean> {
    try {
      const feature = await prisma.featureFlag.findUnique({
        where: { name: featureName }
      });

      if (!feature || !feature.isEnabled) {
        return false;
      }

      // Check plan restrictions
      if (feature.targetPlan && userPlan !== feature.targetPlan) {
        return false;
      }

      // Check rollout percentage (simple percentage check)
      if (feature.rolloutPercentage < 100) {
        const random = Math.random() * 100;
        return random <= feature.rolloutPercentage;
      }

      return true;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }
}
