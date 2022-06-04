from setuptools import setup
with open("README.md", "r") as f:
    long_description = f.read()

setup(
   name='achoz',
   version='0.3.2',
   python_requires=">=3.8",
   description='Search through all your documents like web',
   long_description=long_description,
   long_description_content_type="text/markdown",
   author='Krishna Kanhaiya < kcubeterm >',
   author_email='kcubeterm@gmail.com',
   packages=['achoz'],
   license="AGPL-3",
   include_package_data = True,
   package_data = {
   '' : ['*.png'],
   '' : ['*.html'],
   '' : ['*.css'],
   '' : ['*.js']
   },
   entry_points = {
        'console_scripts': ['achoz=achoz.cli:main'],
    },
   install_requires=["meilisearch==0.18.3","pyramid==2.0","pyinotify==0.9.6","requests==2.22.0","schedule==1.1.0","textract==1.6.5"], 
    classifiers=[
        "Environment :: Console",
        "Environment :: Web Environment",
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Information Technology",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)",
        "Operating System :: Unix",
        "Operating System :: POSIX :: Linux",
        "Topic :: Text Processing",
        "Topic :: Text Processing :: Indexing"
    ]
)