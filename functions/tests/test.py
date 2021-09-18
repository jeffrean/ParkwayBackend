import argparse
import base64
import json
import requests

BASE_URL = 'http://localhost:5001/parkway-api/us-central1'

def parse_args():
    ap = argparse.ArgumentParser()
    
    subparsers = ap.add_subparsers(dest='test_case')

    listing_parser = subparsers.add_parser('listing')
    listing_parser.add_argument('listing_path')

    image_parser = subparsers.add_parser('image')
    image_parser.add_argument('listing_id')
    image_parser.add_argument('image_path')

    args = ap.parse_args()
    return args

def send_image(listing_id, image_path):
    with open(image_path, 'rb') as fp:
        image_bytes = base64.b64encode(fp.read()).decode('utf-8')

    r = requests.post(f'{BASE_URL}/addListingImages',
                      params={'listing_id': listing_id},
                      json={'image_bytes': image_bytes})
    print(r)

def send_listing(listing_path):
    with open(listing_path, 'r') as fp:
        listing = json.load(fp)
    
    r = requests.post(f'{BASE_URL}/createListing', json=listing)
    print(r)

def main(args):
    if args.test_case == 'image':
        send_image(args.listing_id, args.image_path)
    elif args.test_case == 'listing':
        send_listing(args.listing_path)


if __name__ == '__main__':
    args = parse_args()
    main(args)