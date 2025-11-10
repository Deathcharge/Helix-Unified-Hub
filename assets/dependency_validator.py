"""
Dependency validator for optional packages in Helix Collective.

Provides graceful handling and helpful error messages when optional
dependencies are missing.
"""
import logging
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class DependencyInfo:
    """Information about an optional dependency."""
    package_name: str
    import_name: str
    pip_name: str
    purpose: str
    fallback_available: bool = False
    install_command: Optional[str] = None


# Registry of optional dependencies
OPTIONAL_DEPENDENCIES: Dict[str, DependencyInfo] = {
    "webdav": DependencyInfo(
        package_name="WebDAV Client",
        import_name="webdav3.client",
        pip_name="webdav3",
        purpose="Nextcloud storage integration",
        fallback_available=True,
        install_command="pip install webdav3"
    ),
    "boto3": DependencyInfo(
        package_name="Boto3",
        import_name="boto3",
        pip_name="boto3",
        purpose="Backblaze B2 and S3-compatible storage",
        fallback_available=True,
        install_command="pip install boto3"
    ),
    "mega": DependencyInfo(
        package_name="MEGA.py",
        import_name="mega",
        pip_name="mega.py",
        purpose="MEGA cloud storage integration",
        fallback_available=True,
        install_command="pip install --no-deps mega.py"
    ),
    "prophet": DependencyInfo(
        package_name="Prophet",
        import_name="prophet",
        pip_name="prophet",
        purpose="Time series forecasting for analytics",
        fallback_available=False,
        install_command="pip install prophet"
    ),
    "sklearn": DependencyInfo(
        package_name="Scikit-learn",
        import_name="sklearn",
        pip_name="scikit-learn",
        purpose="Machine learning features",
        fallback_available=False,
        install_command="pip install scikit-learn"
    ),
}


class DependencyValidator:
    """Validates and reports on optional dependencies."""

    def __init__(self):
        self.available: Dict[str, bool] = {}
        self.warnings: List[str] = []

    def check_dependency(self, dependency_key: str) -> bool:
        """
        Check if an optional dependency is available.

        Args:
            dependency_key: Key in OPTIONAL_DEPENDENCIES registry

        Returns:
            True if dependency is available, False otherwise
        """
        if dependency_key in self.available:
            return self.available[dependency_key]

        if dependency_key not in OPTIONAL_DEPENDENCIES:
            logger.error(f"Unknown dependency key: {dependency_key}")
            return False

        dep_info = OPTIONAL_DEPENDENCIES[dependency_key]

        try:
            __import__(dep_info.import_name)
            self.available[dependency_key] = True
            logger.info(f"✓ {dep_info.package_name} is available")
            return True
        except ImportError:
            self.available[dependency_key] = False
            self._log_missing_dependency(dep_info)
            return False

    def _log_missing_dependency(self, dep_info: DependencyInfo) -> None:
        """Log a helpful message about a missing dependency."""
        if dep_info.fallback_available:
            logger.warning(
                f"⚠ {dep_info.package_name} is not installed. "
                f"Feature disabled: {dep_info.purpose}. "
                f"To enable, run: {dep_info.install_command}"
            )
        else:
            logger.error(
                f"❌ {dep_info.package_name} is required for {dep_info.purpose}. "
                f"Please install: {dep_info.install_command}"
            )

        self.warnings.append(
            f"{dep_info.package_name}: {dep_info.purpose} unavailable"
        )

    def check_all_optional(self) -> Dict[str, bool]:
        """
        Check all optional dependencies.

        Returns:
            Dict mapping dependency keys to availability status
        """
        results = {}
        for dep_key in OPTIONAL_DEPENDENCIES:
            results[dep_key] = self.check_dependency(dep_key)
        return results

    def get_summary(self) -> Tuple[List[str], List[str]]:
        """
        Get summary of available and missing dependencies.

        Returns:
            Tuple of (available_deps, missing_deps)
        """
        available = []
        missing = []

        for dep_key, is_available in self.available.items():
            dep_info = OPTIONAL_DEPENDENCIES[dep_key]
            if is_available:
                available.append(dep_info.package_name)
            else:
                missing.append(dep_info.package_name)

        return available, missing

    def print_summary(self) -> None:
        """Print a formatted summary of dependency status."""
        available, missing = self.get_summary()

        if available:
            logger.info(f"✅ Available optional packages: {', '.join(available)}")

        if missing:
            logger.warning(f"⚠ Missing optional packages: {', '.join(missing)}")
            logger.warning("Some features may be disabled. See logs above for installation instructions.")


# Global validator instance
_validator = DependencyValidator()


def check_optional_dependency(dependency_key: str) -> bool:
    """
    Check if an optional dependency is available.

    This is the main public API for dependency checking.

    Args:
        dependency_key: Key in OPTIONAL_DEPENDENCIES registry

    Returns:
        True if dependency is available, False otherwise
    """
    return _validator.check_dependency(dependency_key)


def validate_all_dependencies() -> None:
    """
    Validate all optional dependencies on startup.

    Call this during application initialization to check all
    optional dependencies and log helpful warnings.
    """
    logger.info("Validating optional dependencies...")
    _validator.check_all_optional()
    _validator.print_summary()


# Convenience functions for specific dependencies
def has_webdav() -> bool:
    """Check if WebDAV (Nextcloud) support is available."""
    return check_optional_dependency("webdav")


def has_boto3() -> bool:
    """Check if Boto3 (B2/S3) support is available."""
    return check_optional_dependency("boto3")


def has_mega() -> bool:
    """Check if MEGA support is available."""
    return check_optional_dependency("mega")


def has_prophet() -> bool:
    """Check if Prophet forecasting is available."""
    return check_optional_dependency("prophet")


def has_sklearn() -> bool:
    """Check if scikit-learn is available."""
    return check_optional_dependency("sklearn")
