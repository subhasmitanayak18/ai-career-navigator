"""
Utility functions for the AI Career Navigator API.

Utilities:
  - custom_exception_handler: Standardizes all DRF error responses
  - extract_text_from_pdf: Reads and extracts text from an uploaded PDF file
"""

import io

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that wraps all errors in a standardized format.

    All error responses will have the shape:
        {"detail": "Human-readable error message"}

    This makes it easy for frontend clients to consistently parse errors
    without worrying about the varying DRF error formats (e.g., lists vs strings).

    Args:
        exc: The exception that was raised.
        context: The context dict passed by DRF (contains request, view, etc.)

    Returns:
        A Response with a normalized {"detail": "..."} body, or None if the
        exception is not recognized by DRF (which causes Django to handle it).
    """
    # Get DRF's default response first
    response = exception_handler(exc, context)

    if response is not None:
        # Extract a clean error message from whatever DRF returned
        data = response.data

        if isinstance(data, dict):
            # Try common keys: 'detail', then fall back to first value
            if 'detail' in data:
                message = str(data['detail'])
            else:
                # Flatten the first error from any field
                first_value = next(iter(data.values()), 'An error occurred.')
                if isinstance(first_value, list):
                    message = str(first_value[0])
                else:
                    message = str(first_value)
        elif isinstance(data, list):
            message = str(data[0]) if data else 'An error occurred.'
        else:
            message = str(data)

        response.data = {'detail': message}

    return response


def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract all text content from an uploaded PDF file.

    Reads the file using PyPDF2, iterates through all pages,
    and concatenates their text content.

    Args:
        pdf_file: A file-like object (e.g., from request.FILES['resume']).
                  Must be readable as bytes.

    Returns:
        A stripped string containing all text extracted from the PDF.
        Returns an empty string if no text could be extracted.

    Raises:
        Does NOT raise; errors are caught and an empty string is returned.
        Callers should validate that the returned text is non-empty.
    """
    try:
        import PyPDF2

        # Read the file into a BytesIO buffer to support any file-like input
        file_bytes = pdf_file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

        extracted_pages = []
        for page in pdf_reader.pages:
            try:
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(page_text)
            except Exception:
                # Skip pages that fail to extract (e.g., scanned images)
                continue

        full_text = '\n'.join(extracted_pages)
        return full_text.strip()

    except ImportError:
        # PyPDF2 not installed - return empty and let the view handle it
        return ''
    except Exception:
        # Any other error (corrupt PDF, unreadable bytes, etc.)
        return ''
