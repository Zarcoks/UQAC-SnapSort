import unittest
import os

if __name__ == '__main__':
    test_dir = os.path.dirname(__file__)
    suite = unittest.defaultTestLoader.discover(start_dir=test_dir, pattern='test_*.py')
    unittest.TextTestRunner().run(suite)